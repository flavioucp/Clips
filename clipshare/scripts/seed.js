/**
 * Script de Seed: Generar datos de prueba
 * Ejecutar: npm run seed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  console.log('🗑️  Limpiando datos previos...');
  await prisma.like.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.clipTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.clip.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  // Crear usuarios
  console.log('👤 Creando usuarios...');
  const password = await bcrypt.hash('Password123!', 12);

  const user1 = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      password,
      emailVerified: new Date(),
      bio: 'Amante de clips épicos y gaming',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password,
      emailVerified: new Date(),
      bio: 'Admin del sistema',
      role: 'ADMIN',
    },
  });

  console.log(`✅ Usuarios creados: ${user1.email}, ${user2.email}`);

  // Crear tags
  console.log('🏷️  Creando tags...');
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'gaming' } }),
    prisma.tag.create({ data: { name: 'funny' } }),
    prisma.tag.create({ data: { name: 'gaming' } }),
    prisma.tag.create({ data: { name: 'action' } }),
    prisma.tag.create({ data: { name: 'sports' } }),
    prisma.tag.create({ data: { name: 'music' } }),
  ]);

  console.log(`✅ Tags creados: ${tags.map((t) => t.name).join(', ')}`);

  // Crear clips
  console.log('🎬 Creando clips...');
  const clips = [];

  for (let i = 1; i <= 6; i++) {
    const clip = await prisma.clip.create({
      data: {
        userId: i % 2 === 1 ? user1.id : user2.id,
        title: `Clip Demo ${i}`,
        description: `Esta es la descripción del clip de demostración número ${i}. Incluye contenido de prueba para testing.`,
        fileUrl: `https://example.com/video${i}.mp4`,
        thumbnailUrl: `https://example.com/thumb${i}.jpg`,
        duration: 30 + i * 10,
        fileSize: 1024 * 1024 * (50 + i * 10), // Tamaños variados
        mimeType: i % 2 === 0 ? 'video/webm' : 'video/mp4',
        privacy: 'PUBLIC',
        viewsCount: Math.floor(Math.random() * 500),
      },
    });
    clips.push(clip);
  }

  console.log(`✅ Clips creados: ${clips.length}`);

  // Asociar tags a clips
  console.log('🔗 Asociando tags a clips...');
  const tagAssociations = [
    { clipIndex: 0, tagIndices: [0, 3] }, // gaming, action
    { clipIndex: 1, tagIndices: [1, 5] }, // funny, music
    { clipIndex: 2, tagIndices: [0, 3] }, // gaming, action
    { clipIndex: 3, tagIndices: [4, 1] }, // sports, funny
    { clipIndex: 4, tagIndices: [5] }, // music
    { clipIndex: 5, tagIndices: [0, 1] }, // gaming, funny
  ];

  for (const { clipIndex, tagIndices } of tagAssociations) {
    for (const tagIndex of tagIndices) {
      await prisma.clipTag.create({
        data: {
          clipId: clips[clipIndex].id,
          tagId: tags[tagIndex].id,
        },
      });
    }
  }

  console.log('✅ Tags asociados a clips');

  // Crear algunos likes
  console.log('👍 Creando likes...');
  for (let i = 0; i < clips.length; i++) {
    await prisma.like.create({
      data: {
        clipId: clips[i].id,
        userId: i % 2 === 0 ? user1.id : user2.id,
      },
    });
  }

  console.log('✅ Likes creados');

  // Crear comentarios
  console.log('💬 Creando comentarios...');
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        clipId: clips[0].id,
        userId: user2.id,
        content: '¡Excelente clip! Me encantó.',
      },
    }),
    prisma.comment.create({
      data: {
        clipId: clips[0].id,
        userId: user1.id,
        content: 'Gracias, me alegra que te haya gustado! 🎉',
      },
    }),
    prisma.comment.create({
      data: {
        clipId: clips[1].id,
        userId: user1.id,
        content: 'Este clip es muy divertido',
      },
    }),
  ]);

  console.log(`✅ Comentarios creados: ${comments.length}`);

  // Crear reportes (opcional, para testing)
  console.log('⚠️  Creando reportes de ejemplo...');
  await prisma.report.create({
    data: {
      clipId: clips[4].id,
      userId: user2.id,
      reason: 'SPAM',
      description: 'Este clip parece spam',
      status: 'PENDING',
    },
  });

  console.log('✅ Reportes creados');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Datos de prueba:');
  console.log(`   Email Demo: demo@example.com`);
  console.log(`   Email Admin: admin@example.com`);
  console.log(`   Contraseña: Password123!`);
  console.log(`   Clips creados: ${clips.length}`);
  console.log(`   Tags creados: ${tags.length}`);
  console.log(`   Usuarios creados: 2\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
