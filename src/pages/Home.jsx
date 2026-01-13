import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Tag, Cpu } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtenemos productos y categorías en paralelo
        const [prodData, catData] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
        
        // CORRECCIÓN: Asignamos el nombre de la categoría manualmente cruzando los datos.
        // El endpoint de productos solo devuelve category_id, por lo que category_name venía como 'Sin categoría'.
        const productsWithCategories = prodData.map(product => {
          const category = catData.find(c => c.id === product.category_id);
          return {
            ...product,
            category_name: category ? category.name : 'Sin categoría'
          };
        });

        setProducts(productsWithCategories);
        setCategories(catData);
        // Inicializamos los productos filtrados con la data ya corregida
        setFilteredProducts(productsWithCategories);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      if (searchQuery) {
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
        setActiveCategory('Resultados de búsqueda');
        setTimeout(() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        setFilteredProducts(products);
        setActiveCategory('Todos');
      }
    }
  }, [searchQuery, products]);

  const filterByCategory = (categoryName) => {
    setActiveCategory(categoryName);
    if (categoryName === 'Todos') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => p.category_name === categoryName);
      setFilteredProducts(filtered);
    }
  };

  const scrollToProducts = () => {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background" id="inicio">
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center text-center">
        <div className="absolute top-0 w-full h-full overflow-hidden z-0 bg-background">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[150px]"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/30 backdrop-blur-md shadow-sm shadow-primary/20">
              <Cpu size={16} /> Nueva Colección 2025
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-text-primary mb-8 tracking-tight leading-tight">
              Nexus <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-300% animate-gradient drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                Hardware
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Ingeniería avanzada y estética nocturna. <br className="hidden md:block"/> 
              Equipamiento diseñado para el mundo digital.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0, 229, 255, 0.5)' }} 
              whileTap={{ scale: 0.95 }} 
              onClick={scrollToProducts}
              className="bg-primary hover:bg-primary-hover text-text-inverse px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-primary/30 flex items-center gap-3 mx-auto relative overflow-hidden group"
            >
              <span className="relative z-10">Explorar Catálogo</span> <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform"/>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* STRIP: border-ui-border */}
      <div className="bg-surface border-y border-ui-border relative z-20 -mt-8 mx-0 md:mx-8 lg:mx-12 rounded-none md:rounded-2xl shadow-xl shadow-black/20 backdrop-blur-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ui-border">
          {[
            { icon: Zap, title: "Envío Flash", desc: "Entrega en 24h garantizada" },
            { icon: Shield, title: "Garantía Premium", desc: "2 años de cobertura total" },
            { icon: Truck, title: "Envío Gratis", desc: "A todo el país desde $100" },
          ].map((feature, idx) => {
             const Icon = feature.icon;
             return (
              <div key={idx} className="flex items-center justify-center gap-5 p-8 group hover:bg-background/50 transition-colors">
                <div className="p-4 bg-background rounded-2xl text-primary shadow-inner shadow-primary/5 border border-ui-border group-hover:border-primary/50 group-hover:shadow-primary/20 transition-all"><Icon size={28} /></div>
                <div className="text-left">
                  <h3 className="font-bold text-text-primary text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section id="categorias" className="py-24 bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/50 to-background pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold text-text-primary mb-10 tracking-tight"><span className="text-primary">///</span> Explora por Categorías</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Todos', ...categories.map(c => c.name)].map((catName, index) => (
              <button 
                key={index}
                onClick={() => filterByCategory(catName)} 
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 border backdrop-blur-md ${
                  activeCategory === catName 
                    ? 'bg-primary/90 text-text-inverse border-primary shadow-lg shadow-primary/25 scale-105' 
                    : 'bg-surface/80 text-text-secondary hover:text-primary hover:border-primary/50 hover:bg-surface border-ui-border'
                }`}
              >
                {catName === 'Todos' ? <Zap size={18} /> : <Tag size={18} />} {catName}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-32 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-ui-border pb-6">
          <div>
            <h2 className="text-4xl font-bold text-text-primary mb-3 tracking-tight">Catálogo <span className="text-primary">.NET</span></h2>
            <p className="text-text-secondary text-lg font-light">
              {searchQuery ? `Buscando: "${searchQuery}"` : `Mostrando ${filteredProducts.length} items en ${activeCategory}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (<div key={n} className="bg-surface rounded-3xl h-[450px] animate-pulse border border-ui-border shadow-xl"></div>))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-20 text-text-muted bg-surface/50 rounded-3xl border border-ui-border">
            <p className="text-xl mb-4">No se encontraron señales de productos.</p>
            <button onClick={() => { filterByCategory('Todos'); }} className="text-primary mt-2 hover:underline font-medium">Reiniciar sistemas</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;