import fs from 'node:fs/promises';
const images = { living: 'photo-1600210492486-724fe5c67fb0', dining: 'photo-1616486338812-3dadae4b4ace', architecture: 'photo-1600607687939-ce8a6c25118c', warm: 'photo-1600607687920-4e2a09cf159d', bedroom: 'photo-1616594039964-ae9021a400a0', house: 'photo-1600047509807-ba8f99d2cdde' };
await fs.mkdir('public/images', { recursive: true });
await Promise.all(Object.entries(images).map(async ([name, id]) => {
  const response = await fetch(`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=85`);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  await fs.writeFile(`public/images/${name}.jpg`, Buffer.from(await response.arrayBuffer()));
  console.log(`Downloaded ${name}`);
}));
