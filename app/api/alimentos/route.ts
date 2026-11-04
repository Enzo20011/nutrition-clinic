import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getValidSession, unauthorizedResponse } from '@/lib/protectApi';
import { searchUSDA } from '@/lib/usdaApi';

/**
 * GET /api/alimentos
 * Hybrid Search (Local PostgreSQL + USDA API)
 */
export async function GET(req: Request) {
  const session = await getValidSession();
  if (!session) return unauthorizedResponse();
  
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';
  const categoria = searchParams.get('categoria');

  try {
    // Si la categoría es USDA o ALL, buscamos en USDA de forma secundaria
    let usdaResults: any[] = [];
    if (categoria === 'USDA' || categoria === 'ALL') {
       usdaResults = await searchUSDA(search);
    }

    if (categoria === 'USDA') {
      return NextResponse.json({ data: usdaResults });
    }

    // Buscamos en local (PostgreSQL)
    let localAlimentos: any[] = [];
    
    if (search) {
      // Función para generar regex que ignore acentos (Compatible con POSIX Regex de Postgres)
      const normalizeRegex = (str: string) => {
        return str
          .replace(/[aáàäâ]/gi, '[aáàäâ]')
          .replace(/[eéèëê]/gi, '[eéèëê]')
          .replace(/[iíìïî]/gi, '[iíìïî]')
          .replace(/[oóòöô]/gi, '[oóòöô]')
          .replace(/[uúùüû]/gi, '[uúùüû]');
      };
      
      const regexPattern = normalizeRegex(search);

      // Filtros adicionales para PostgreSQL (parameterizado para evitar SQL injection)
      const origen = (categoria && categoria !== 'ALL' && categoria !== 'USDA')
        ? (categoria === 'ARGENFOODS' ? 'ARGENFOODS' : categoria)
        : null;

      // Query nativo para soportar el regex de acentos con performance
      if (origen) {
        localAlimentos = await prisma.$queryRawUnsafe(
          `SELECT * FROM "Alimento" WHERE "nombre" ~* $1 AND "origen" = $2 LIMIT 50`,
          regexPattern,
          origen
        );
      } else {
        localAlimentos = await prisma.$queryRawUnsafe(
          `SELECT * FROM "Alimento" WHERE "nombre" ~* $1 LIMIT 50`,
          regexPattern
        );
      }
    } else {
      // Búsqueda sin término (solo filtros)
      const where: any = {};
      if (categoria && categoria !== 'ALL' && categoria !== 'USDA') {
        where.origen = categoria === 'ARGENFOODS' ? 'ARGENFOODS' : categoria;
      }
      localAlimentos = await prisma.alimento.findMany({
        where,
        take: 50
      });
    }

    const formattedLocal = localAlimentos.map((a: any) => ({
      _id: a.id,
      nombre: a.nombre,
      calorias: a.calorias,
      proteinas: a.proteinas,
      carbohidratos: a.carbohidratos,
      grasas: a.grasas,
      origen: a.origen,
      idExterno: a.idExterno
    }));

    // Combinación Híbrida Inteligente (Prioridad Local)
    let finalResults = formattedLocal;
    
    // Solo llamar a USDA si hay pocos resultados locales o se pidió explícitamente
    if (categoria === 'USDA' || (categoria === 'ALL' && finalResults.length < 5)) {
       // Si no se cargaron antes, cargar ahora (aunque el bloque inicial ya lo hace si es ALL)
       if (usdaResults.length === 0 && search) {
         usdaResults = await searchUSDA(search);
       }
       
       const existingNames = new Set(finalResults.map(r => r.nombre.toLowerCase()));
       const filteredUSDA = usdaResults
         .filter(r => !existingNames.has(r.nombre.toLowerCase()))
         .map(r => ({ ...r, _id: r.idExterno }));
       
       finalResults = [...finalResults, ...filteredUSDA].slice(0, 50);
    }

    return NextResponse.json({ data: finalResults });
  } catch (error: any) {
    console.error('Error en buscador de alimentos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
