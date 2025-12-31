import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowLeft, Minus, Plus, Truck, ShieldCheck, User as UserIcon, Tag, Package, Layers } from 'lucide-react';
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
        const [prodData, categories, reviewData] = await Promise.all([
          productService.getById(id),
          categoryService.getAll(),
          reviewService.getByProduct(id)
        ]);
        
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
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-text-secondary hover:text-primary transition-colors text-sm font-medium group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Volver al catálogo
          </Link>
        </div>

        {/* Product Main Section - Nuevo diseño sin imagen */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-3xl border border-ui-border overflow-hidden shadow-2xl shadow-black/20 mb-16"
        >
          {/* Header con gradiente */}
          <div className="bg-gradient-to-br from-background via-background to-primary/10 p-8 pb-6 border-b border-ui-border">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-surface border border-ui-border text-primary px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                <Tag size={12}/> {product.category_name}
              </span>
              <div className="flex items-center bg-surface border border-ui-border rounded-lg px-2.5 py-1.5 gap-1.5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-text-primary">{product.rating.toFixed(1)}</span>
                <span className="text-text-muted text-xs">({reviews.length} opiniones)</span>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${product.stock > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
              </span>
            </div>

            <div className="flex items-start gap-6">
              {/* Icono decorativo grande */}
              <div className="hidden sm:flex w-24 h-24 bg-primary/10 rounded-2xl items-center justify-center border border-primary/20 shrink-0">
                <Package size={48} className="text-primary" />
              </div>
              
              <div className="flex-grow">
                <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-3 tracking-tight leading-tight">
                  {product.name}
                </h1>
                <p className="text-text-secondary text-base leading-relaxed font-light max-w-2xl">
                  {product.description || 'Producto de alta calidad disponible en TechStore. Diseñado para ofrecer el mejor rendimiento y durabilidad.'}
                </p>
              </div>
            </div>
          </div>

          {/* Cuerpo con precio y acciones */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna izquierda: Precio */}
              <div>
                <span className="text-sm text-text-muted uppercase tracking-wider font-medium block mb-2">Precio</span>
                <span className="text-5xl font-bold text-primary tracking-tight block mb-6">
                  ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-2 bg-background p-3 rounded-xl border border-ui-border">
                    <Truck size={18} className="text-primary"/> 
                    <span>Envío gratis disponible</span>
                  </div>
                  <div className="flex items-center gap-2 bg-background p-3 rounded-xl border border-ui-border">
                    <ShieldCheck size={18} className="text-primary"/> 
                    <span>Garantía de 2 años</span>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Acciones */}
              <div className="bg-background rounded-2xl p-6 border border-ui-border">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-medium text-text-primary">Cantidad</span>
                  <div className="flex items-center bg-surface rounded-lg border border-ui-border p-1">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-background rounded-md transition-colors"><Minus size={18} /></button>
                    <span className="w-12 text-center font-bold text-text-primary tabular-nums text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-background rounded-md transition-colors"><Plus size={18} /></button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-text-muted mb-6 pb-6 border-b border-ui-border border-dashed">
                  <span>Subtotal</span>
                  <span className="font-bold text-text-primary text-lg">${(product.price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <button 
                  onClick={handleAddToCart} 
                  disabled={product.stock === 0} 
                  className="w-full bg-primary hover:bg-primary-hover text-text-inverse py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <ShoppingCart size={22} className="group-hover:rotate-12 transition-transform"/> Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </motion.div>

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