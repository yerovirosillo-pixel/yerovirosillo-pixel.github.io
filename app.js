const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── DATA ────────────────────────────────────────────────────────────────────
const profile = {
  name: 'Yerovi Rosillo',
  role: 'Desarrollador Full-Stack & Fotógrafo',
  bio: 'Apasionado por la tecnología. Construyo experiencias digitales que combinan funcionalidad con estética. Amante de los viajes, el café y los amaneceres en la montaña.',
  location: 'Pucallpa, Perú',
  avatar: '/images/descarga.jpg',
  stats: { fotos: 24, álbumes: 3, seguidores: 1280 }
};

const albums = [
  {
    id: 1,
    title: 'Naturaleza Salvaje',
    cover: 'https://picsum.photos/seed/nat1/600/400',
    description: 'Paisajes y fauna de la selva peruana',
    photos: [
      { id: 101, url: 'https://www.shutterstock.com/image-photo/amazon-river-amazonas-brazil-beautiful-260nw-1389271520.jpg', title: 'Amanecer en el Amazonas', likes: 47 },
      { id: 102, url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/8b/c1/55/photo2jpg.jpg?w=600&h=400&s=1', title: 'Río Ucayali', likes: 35 },
      { id: 103, url: 'https://www.clarin.com/2019/07/13/c-v4mROTC_2000x1500__1.jpg', title: 'Mariposas del trópico', likes: 62 }
    ]
  },
  {
    id: 2,
    title: 'Vida Urbana',
    cover: 'https://picsum.photos/seed/city1/600/400',
    description: 'Arquitectura y calles de la ciudad',
    photos: [
      { id: 201, url: 'https://portal.andina.pe/EDPFotografia3/thumbnail/2022/06/18/000876822M.jpg', title: 'Centro histórico', likes: 29 },
      { id: 202, url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbCIq_lUaZjgOqtwuf9V-UajNLsAWlbxYpdg&s', title: 'Luces nocturnas', likes: 53 },
      { id: 203, url: 'https://imgs.deperu.com/alimentacion/comestibles_mercado.jpg', title: 'Mercado central', likes: 41 }
    ]
  },
  {
    id: 3,
    title: 'Retratos',
    cover: 'https://picsum.photos/seed/port1/600/400',
    description: 'Historias contadas a través del rostro humano',
    photos: [
      { id: 301, url: 'https://constructivo.com/imgPosts/1720561141mbkKnCVW.jpg', title: 'bulevar yarinacocha', likes: 88 },
      { id: 302, url: 'https://i.imgflip.com/8gd2vr.jpg', title: 'Maestra de anatomia', likes: 71 },
      { id: 303, url: 'https://images7.memedroid.com/images/UPLOADED426/62cf44e7f3df1.jpeg', title: 'animal', likes: 95 }
    ]
  }
];

const contacts = [
  { id: 1, name: 'Mia Gol osa', role: 'Diseñadora UX', avatar: 'https://i.pravatar.cc/80?img=5', email: 'maria@example.com', phone: '+51 987 654 321' },
  { id: 2, name: 'Carlos Mendoza', role: 'Fotógrafo', avatar: 'https://i.pravatar.cc/80?img=8', email: 'carlos@example.com', phone: '+51 912 345 678' },
  { id: 3, name: 'Sofía Ramos', role: 'Desarrolladora', avatar: 'https://i.pravatar.cc/80?img=16', email: 'sofia@example.com', phone: '+51 965 432 109' },
  { id: 4, name: 'Diego Flores', role: 'Videógrafo', avatar: 'https://i.pravatar.cc/80?img=11', email: 'diego@example.com', phone: '+51 934 567 890' },
  { id: 5, name: 'Valentina Cruz', role: 'Artista Digital', avatar: 'https://i.pravatar.cc/80?img=20', email: 'valentina@example.com', phone: '+51 978 901 234' },
  { id: 6, name: 'Andrés Paredes', role: 'Community Manager', avatar: 'https://i.pravatar.cc/80?img=33', email: 'andres@example.com', phone: '+51 956 789 012' }
];

// In-memory state
let likesState = {};
albums.forEach(a => a.photos.forEach(p => { likesState[p.id] = p.likes; }));
let favorites = [];

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.render('index', { profile, albums, contacts });
});

// AJAX: Toggle like
app.post('/api/like/:photoId', (req, res) => {
  const id = parseInt(req.params.photoId);
  const { action } = req.body;
  if (likesState[id] !== undefined) {
    likesState[id] += action === 'like' ? 1 : -1;
    res.json({ success: true, likes: likesState[id] });
  } else {
    res.status(404).json({ success: false });
  }
});

// AJAX: Get contacts (with optional search)
app.get('/api/contacts', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const result = q
    ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q))
    : contacts;
  res.json(result);
});

// AJAX: Toggle favorite
app.post('/api/favorite', (req, res) => {
  const { photoId, albumId, photoUrl, photoTitle } = req.body;
  const pid = parseInt(photoId);
  const exists = favorites.find(f => f.photoId === pid);
  if (exists) {
    favorites = favorites.filter(f => f.photoId !== pid);
    res.json({ saved: false, count: favorites.length });
  } else {
    favorites.push({ photoId: pid, albumId, photoUrl, photoTitle, savedAt: new Date().toISOString() });
    res.json({ saved: true, count: favorites.length });
  }
});

// AJAX: Get favorites
app.get('/api/favorites', (req, res) => {
  res.json(favorites);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅  Servidor corriendo en http://localhost:${PORT}`));
