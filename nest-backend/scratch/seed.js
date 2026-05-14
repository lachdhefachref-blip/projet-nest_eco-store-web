const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  stock: Number,
  rating: Number,
  ratingsCount: Number,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

const products = [
  {
    name: "iPhone 15 Pro Max",
    description: "Le summum de l'iPhone avec un châssis en titane, la puce A17 Pro et un système photo pro avancé avec zoom optique 5x.",
    price: 1479,
    category: "Smartphones",
    image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708",
    stock: 50,
    rating: 4.9,
    ratingsCount: 120
  },
  {
    name: "MacBook Air M3 13\"",
    description: "Le portable le plus populaire au monde, maintenant avec la puce M3 ultra-puissante. Incroyablement fin et rapide.",
    price: 1299,
    category: "Laptops",
    image: "https://www.apple.com/v/macbook-air/s/images/overview/m3/hero_macbook_air_13_15_midnight__f8re0m9i0re6_large.jpg",
    stock: 30,
    rating: 4.8,
    ratingsCount: 85
  },
  {
    name: "Sony WH-1000XM5",
    description: "La référence absolue du casque à réduction de bruit. Son cristallin, appels parfaits et confort exceptionnel.",
    price: 399,
    category: "Audio",
    image: "https://m.media-amazon.com/images/I/61S+0Y6fNEL._AC_SL1500_.jpg",
    stock: 100,
    rating: 4.7,
    ratingsCount: 250
  },
  {
    name: "PlayStation 5 Slim",
    description: "Vivez une expérience de jeu nouvelle génération avec des graphismes incroyables et un SSD ultra-rapide.",
    price: 549,
    category: "Gaming",
    image: "https://m.media-amazon.com/images/I/51fS8L9M+TL._AC_SL1500_.jpg",
    stock: 45,
    rating: 4.9,
    ratingsCount: 400
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Découvrez l'IA mobile avec le Galaxy S24 Ultra. Écran QHD+ de 6,8 pouces et stylet S Pen intégré.",
    price: 1459,
    category: "Smartphones",
    image: "https://m.media-amazon.com/images/I/71WjsZmiAyL._AC_SL1500_.jpg",
    stock: 25,
    rating: 4.8,
    ratingsCount: 60
  },
  {
    name: "iPad Pro M4 11\"",
    description: "Le nouvel iPad Pro, incroyablement fin, doté de l'écran Ultra Retina XDR le plus avancé au monde.",
    price: 1069,
    category: "Tablets",
    image: "https://m.media-amazon.com/images/I/61NfT+7UfSL._AC_SL1500_.jpg",
    stock: 15,
    rating: 5.0,
    ratingsCount: 30
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    
    // Clear existing products if needed
    // await Product.deleteMany({});
    
    await Product.insertMany(products);
    console.log("Products seeded successfully!");
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
