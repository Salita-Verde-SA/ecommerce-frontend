import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowLeft, Minus, Plus, Truck, ShieldCheck, User as UserIcon, Tag } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { reviewService } from '../services/reviewService';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import AlertModal from '../components/ui/AlertModal';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const addToCart = useCartStore(state => state.addToCart);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showAlert = (type, title, message) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtenemos producto, categorías y reseñas en paralelo
        const [prodData, categories, reviewData] = await Promise.all([
          productService.getById(id),
          categoryService.getAll(),
          reviewService.getByProduct(id)
        ]);
        
        // Cruzamos para obtener el nombre de categoría correcto
        const category = categories.find(c => c.id === prodData.category_id);
        const productWithCategory = {
          ...prodData,
          category_name: category ? category.name : 'Sin categoría'
        };
        
        setProduct(productWithCategory);
        setReviews(reviewData);
      } catch (error) { navigate('/'); } finally { setLoading(false); }
    };
    loadData();
  }, [id, navigate]);

  const handleAddToCart = () => { addToCart(product, quantity); navigate('/cart'); };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showAlert('warning', 'Acceso Restringido', 'Debes iniciar sesión para publicar una reseña.');
      return;
    }
    if (newReview.comment.length < 10) {
      showAlert('warning', 'Comentario muy corto', 'Por favor escribe al menos 10 caracteres para que tu opinión sea útil.');
      return;
    }
    try {
      const created = await reviewService.create({ ...newReview, product_id: parseInt(id), user_id: user.id, user_name: user.name });
      setReviews([...reviews, created]);
      setNewReview({ rating: 5, comment: '' });
      showAlert('success', '¡Gracias!', 'Tu reseña ha sido publicada exitosamente.');
    } catch (error) { 
      console.error(error);
      showAlert('error', 'Error', 'Ocurrió un error al publicar tu reseña. Inténtalo de nuevo.');
    }
  };

  if (loading || !product) return <div className="h-screen flex items-center justify-center bg-background text-primary">Cargando...</div>;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-text-secondary hover:text-primary transition-colors text-sm font-medium group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Volver al catálogo
          </Link>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Image Column */}
          <div className="lg:col-span-7">
            {/* Badge de categoría FUERA de la imagen */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 bg-surface border border-ui-border text-primary px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                <Tag size={12}/> {product.category_name}
              </span>
            </div>
            
            <div className="bg-surface rounded-3xl border border-ui-border overflow-hidden relative group h-full min-h-[400px] flex items-center justify-center p-8 shadow-2xl shadow-black/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <motion.img 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                src={product.image_url} 
                alt={product.name} 
                className="w-full max-h-[500px] object-contain drop-shadow-xl relative z-10 mix-blend-multiply dark:mix-blend-normal" 
              />
              {/* Badge removido de aquí */}
            </div>
          </div>
          
          {/* Info Column */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center bg-surface border border-ui-border rounded-lg px-2 py-1 gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-text-primary">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-text-muted text-sm">({reviews.length} opiniones)</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-ui-border border-dashed">
                <span className="text-4xl font-bold text-primary tracking-tight">
                  ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${product.stock > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {product.stock > 0 ? 'Disponible' : 'Agotado'}
                </span>
              </div>

              <p className="text-text-secondary text-base leading-relaxed mb-8 font-light">
                {product.description}
              </p>
              
              <div className="bg-surface rounded-2xl p-6 border border-ui-border shadow-sm mb-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">Cantidad</span>
                  <div className="flex items-center bg-background rounded-lg border border-ui-border p-1">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface rounded-md transition-colors"><Minus size={16} /></button>
                    <span className="w-10 text-center font-bold text-text-primary tabular-nums">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-surface rounded-md transition-colors"><Plus size={16} /></button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart} 
                  disabled={product.stock === 0} 
                  className="w-full bg-primary hover:bg-primary-hover text-text-inverse py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform"/> Agregar al Carrito
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-text-secondary">
                <div className="flex items-center gap-2"><Truck size={16} className="text-primary"/> Envío gratis disponible</div>
                <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary"/> Garantía de 2 años</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-t border-ui-border pt-16">
          <div className="lg:col-span-4">
             <div className="sticky top-24">
                <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  Opiniones <span className="text-text-muted text-lg font-normal">({reviews.length})</span>
                </h3>
                
                <div className="bg-surface p-6 rounded-2xl border border-ui-border shadow-sm mb-8">
                  <h4 className="font-bold text-text-primary mb-4">Escribe tu opinión</h4>
                  {isAuthenticated ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setNewReview({...newReview, rating: star})} className="focus:outline-none transition-transform hover:scale-110">
                            <Star size={22} className={star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                          </button>
                        ))}
                      </div>
                      <textarea required value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} rows="4" className="w-full p-3 text-sm border border-ui-border rounded-xl focus:ring-1 focus:ring-primary outline-none bg-background text-text-primary placeholder-text-muted resize-none" placeholder="¿Qué te pareció el producto?"></textarea>
                      <button type="submit" className="w-full bg-surface border border-primary/20 hover:bg-primary hover:text-text-inverse text-primary py-2.5 rounded-xl font-bold transition-all text-sm">Publicar Reseña</button>
                    </form>
                  ) : (
                    <div className="text-center py-6 bg-background rounded-xl border border-dashed border-ui-border">
                      <p className="text-text-secondary text-sm mb-3">Inicia sesión para compartir tu experiencia.</p>
                      <Link to="/login" className="text-primary font-bold text-sm hover:underline">Ir a Iniciar Sesión</Link>
                    </div>
                  )}
                </div>
             </div>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map((review) => (
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={review.id} className="bg-surface p-5 rounded-2xl border border-ui-border hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-background border border-ui-border rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
                        {review.user_name?.charAt(0).toUpperCase() || <UserIcon size={18}/>}
                      </div>
                      <div>
                        <span className="font-bold text-text-primary block text-sm">{review.user_name}</span>
                        <div className="flex text-yellow-400 scale-90 origin-left">
                          {[...Array(5)].map((_, i) => (<Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted bg-background px-2 py-1 rounded-md border border-ui-border">{review.date}</span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed pl-[52px]">{review.comment}</p>
                </motion.div>
              )) : (
                <div className="text-center py-12 bg-surface/30 rounded-3xl border border-dashed border-ui-border">
                  <div className="inline-flex p-4 bg-background rounded-full mb-3 text-text-muted"><Star size={24} className="opacity-50"/></div>
                  <p className="text-text-secondary">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertModal 
        isOpen={alertModal.isOpen} 
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })} 
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default ProductDetail;