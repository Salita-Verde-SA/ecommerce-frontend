import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowLeft, Minus, Plus, Truck, ShieldCheck, User as UserIcon } from 'lucide-react';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodData = await productService.getById(id);
        const reviewData = await reviewService.getByProduct(id);
        setProduct(prodData);
        setReviews(reviewData);
      } catch (error) { navigate('/'); } finally { setLoading(false); }
    };
    loadData();
  }, [id, navigate]);

  const handleAddToCart = () => { addToCart(product, quantity); navigate('/cart'); };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert("Debes iniciar sesión.");
    if (newReview.comment.length < 10) return alert("Comentario muy corto.");
    try {
      const created = await reviewService.create({ ...newReview, product_id: parseInt(id), user_id: user.id, user_name: user.name });
      setReviews([...reviews, created]);
      setNewReview({ rating: 5, comment: '' });
    } catch (error) { console.error(error); }
  };

  if (loading || !product) return <div className="h-screen flex items-center justify-center bg-background text-primary">Cargando...</div>;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center text-text-secondary hover:text-primary mb-8 transition-colors font-medium">
          <ArrowLeft size={20} className="mr-2" /> Volver al catálogo
        </Link>

        <div className="bg-surface rounded-3xl shadow-2xl shadow-black/40 overflow-hidden mb-12 border border-ui-border">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-16 bg-background/50 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-ui-border">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-75"></div>
              <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={product.image_url} alt={product.name} className="w-full max-w-md object-contain drop-shadow-2xl relative z-10" />
            </div>
            
            <div className="p-8 lg:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (<Star key={i} size={18} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />))}
                </div>
                <span className="text-text-secondary text-sm font-medium">({product.rating} / 5)</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">{product.name}</h1>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(204,255,0,0.3)]">${product.price}</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                </span>
              </div>
              <p className="text-text-secondary text-lg leading-relaxed mb-8 border-b border-ui-border pb-8 font-light">{product.description}</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <span className="text-text-primary font-bold">Cantidad:</span>
                  <div className="flex items-center border border-ui-border rounded-xl bg-background">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-text-primary hover:text-primary"><Minus size={18} /></button>
                    <span className="w-12 text-center font-bold text-text-primary">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 text-text-primary hover:text-primary"><Plus size={18} /></button>
                  </div>
                </div>
                <button onClick={handleAddToCart} disabled={product.stock === 0} className="w-full bg-primary hover:bg-primary-hover text-black py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                  <ShoppingCart size={22} /> Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-3xl shadow-lg border border-ui-border p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-text-primary mb-8">Opiniones de Clientes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {reviews.length > 0 ? reviews.map((review) => (
                <div key={review.id} className="bg-background p-6 rounded-2xl border border-ui-border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-surface border border-ui-border rounded-full flex items-center justify-center"><UserIcon size={16} className="text-primary"/></div>
                      <span className="font-bold text-text-primary">{review.user_name}</span>
                    </div>
                    <span className="text-xs text-text-muted">{review.date}</span>
                  </div>
                  <div className="flex text-primary mb-2">{[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />))}</div>
                  <p className="text-text-secondary text-sm">{review.comment}</p>
                </div>
              )) : <p className="text-text-muted italic">No hay reseñas aún.</p>}
            </div>

            <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20">
              <h3 className="text-lg font-bold text-text-primary mb-4">Escribir una reseña</h3>
              {isAuthenticated ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Puntuación</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setNewReview({...newReview, rating: star})} className="focus:outline-none">
                          <Star size={24} className={star <= newReview.rating ? "text-primary fill-primary" : "text-gray-600"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Comentario</label>
                    <textarea required value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} rows="4" className="w-full p-3 border border-ui-border rounded-xl focus:ring-1 focus:ring-primary outline-none bg-background text-text-primary placeholder-text-muted" placeholder="Tu opinión..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">Publicar Opinión</button>
                </form>
              ) : (
                <div className="text-center py-8"><p className="text-text-secondary mb-4">Inicia sesión para opinar.</p><Link to="/login" className="text-primary font-bold hover:underline">Ir al Login</Link></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;