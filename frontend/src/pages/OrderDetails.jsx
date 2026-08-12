import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiChevronRight, FiFileText, FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, formatPrice } = useContext(AppContext);

  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    setOrder(null);
    setNotFound(false);

    getOrderById(id).then((result) => {
      if (!mounted) return;
      if (result) setOrder(result);
      else setNotFound(true);
    });

    return () => {
      mounted = false;
    };
  }, [id, getOrderById]);

  if (notFound) {
    return <div className="py-12 text-center text-gray-500">Order not found.</div>;
  }

  if (!order) {
    return <div className="py-12 text-center text-gray-500">Loading order details...</div>;
  }

  // Prefer backend pricing — frontend calculations are only a display fallback.
  const subtotal = order.pricing?.subtotal ??
    order.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const gst = order.pricing?.tax ?? Math.round(subtotal * 0.12);
  const shipping = order.pricing?.shippingCharges ??
    (subtotal > 20000 ? 0 : 150);
  const discount = order.pricing?.discount ??
    (subtotal + gst + shipping - order.amount);

  return (
    <div className="space-y-8">
      {/* Breadcrumb Header */}
      <div className="border-b border-white/5 pb-6 text-left">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
          <Link to="/orders" className="hover:underline">Orders</Link>
          <FiChevronRight />
          <span className="text-white">Order Details</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FiFileText className="text-primary" />
          <span>Details: {order.id}</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Order receipt, billing logs, and delivery coordinates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left Column: Receipt logs & Items list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items list */}
          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ordered Items</h3>
            <div className="divide-y divide-white/5 space-y-4">
              {order.items.map((item) => {
                const productImage =
                  item.product?.image ||
                  item.product?.images?.find(img => img.isPrimary)?.url ||
                  item.product?.images?.[0]?.url ||
                  item.image ||
                  '';
                return (
                  <div key={item.product.id || item.product._id} className="flex items-center gap-4 pt-4 first:pt-0">
                    <img src={productImage} alt={item.product.title} className="w-16 h-16 rounded-xl object-cover bg-black/20" />
                    <div className="flex-grow">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{item.product.title}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Brand: {item.product.brand} | Qty: {item.quantity}</p>
                      <p className="text-xs font-extrabold text-white mt-1">{formatPrice(item.product.price)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Billing Address blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Address */}
            <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FiMapPin className="text-primary" />
                <span>Shipping Address</span>
              </h4>
              <div className="text-xs text-gray-400 leading-relaxed font-medium space-y-0.5">
                {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                  <>
                    <p className="text-white font-bold mb-1">
                      {order.shippingAddress.fullName || `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim()}
                    </p>
                    {(order.shippingAddress.addressLine1 || order.shippingAddress.street) && (
                      <p>{order.shippingAddress.addressLine1 || order.shippingAddress.street}</p>
                    )}
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>
                      {[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')}
                      {(order.shippingAddress.pincode || order.shippingAddress.zipCode) ? ` - ${order.shippingAddress.pincode || order.shippingAddress.zipCode}` : ''}
                    </p>
                    {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                    {order.shippingAddress.phone && <p className="mt-2 pt-2 border-t border-white/5">Phone: {order.shippingAddress.phone}</p>}
                  </>
                ) : order.shippingAddressText || order.shippingAddress ? (
                  <p>{order.shippingAddressText || order.shippingAddress}</p>
                ) : (
                  <p className="italic opacity-50">Address unavailable</p>
                )}
              </div>
            </div>

            {/* Billing Method */}
            <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FiCreditCard className="text-primary" />
                <span>Payment Mode</span>
              </h4>
              <p className="text-xs text-gray-400 font-medium">Method: {order.paymentMethod}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1">Status: Paid & Authorized</p>
            </div>

          </div>

        </div>

        {/* Right Column: Invoice pricing summary sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Invoice Statement</h3>
            
            <div className="space-y-2 text-xs divide-y divide-white/5">
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>GST (12%)</span>
                <span className="text-white">{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>Shipping fee</span>
                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1.5 text-green-500 font-semibold">
                  <span>Discount Applied</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 text-sm font-bold text-white">
                <span>Grand Total Paid</span>
                <span className="text-primary text-base">{formatPrice(order.amount)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/track-order/${order.id}`)}
              className="w-full btn-glow-yellow text-xs font-bold py-3 flex items-center justify-center gap-1.5"
            >
              <FiTruck />
              <span>Track Live Delivery</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrderDetails;
