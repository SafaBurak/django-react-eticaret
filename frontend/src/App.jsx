import { useState, useEffect } from 'react';

export default function App() {
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [cart, setCart] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [users, setUsers] = useState([]);

  // Load data on mount
  useEffect(() => {
    fetch('/api/items/')
      .then(res => res.json())
      .then(data => setItems(data));

    fetch('/api/vouchers/')
      .then(res => res.json())
      .then(data => setVouchers(data));
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const res = await fetch('/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      const user = await res.json();
      setCurrentUser(user);
      setPage('home');
    } else {
      alert('Login failed');
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch('/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (res.ok) {
      const user = await res.json();
      setCurrentUser(user);
      setPage('home');
    } else {
      alert('Registration failed');
    }
  };

  // Add to cart
  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
  };

  // Apply voucher
  const applyVoucher = (code) => {
    const voucher = vouchers.find(v => v.code === code);
    if (voucher) {
      alert(`Applied voucher: ${code} - ${voucher.discount}% off`);
    } else {
      alert("Invalid voucher");
    }
  };

  // Fetch users (Admin only)
  useEffect(() => {
    if (page === 'admin' && currentUser?.role === 'Admin') {
      fetch('/api/users/')
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [page, currentUser]);

  // Delete user
  const deleteUser = async (id) => {
    const res = await fetch(`/api/users/${id}/`, {
      method: 'DELETE'
    });
    if (res.status === 204) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <LandingPage items={items} setPage={setPage} setSelectedItem={setSelectedItem} currentUser={currentUser} />;
      case 'items':
        return <ItemListPage items={items} setPage={setPage} setSelectedItem={setSelectedItem} addToCart={addToCart} />;
      case 'details':
        return selectedItem ? (
          <ItemDetailsPage item={selectedItem} setPage={setPage} addToCart={addToCart} />
        ) : (
          <div className="text-center py-16">No item selected.</div>
        );
      case 'login':
        return <LoginPage handleLogin={handleLogin} setPage={setPage} />;
      case 'register':
        return <RegisterPage handleRegister={handleRegister} setPage={setPage} otpSent={otpSent} setOtpSent={setOtpSent} />;
      case 'checkout':
        return <CheckoutPage cart={cart} removeFromCart={removeFromCart} applyVoucher={applyVoucher} setPage={setPage} />;
      case 'thankyou':
        return <ThankYouPage setPage={setPage} />;
      case 'admin':
        return <AdminDashboard users={users} deleteUser={deleteUser} setPage={setPage} currentUser={currentUser} />;
      case 'voucher':
        return <VoucherPage vouchers={vouchers} setVouchers={setVouchers} setPage={setPage} />;
      default:
        return <LandingPage items={items} setPage={setPage} setSelectedItem={setSelectedItem} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} setPage={setPage} />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

// Header Component
function Header({ currentUser, setPage }) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Django Shop</h1>
        <nav>
          <ul className="flex space-x-6">
            <li><button onClick={() => setPage('home')} className="text-gray-700 hover:text-indigo-600 transition">Home</button></li>
            <li><button onClick={() => setPage('items')} className="text-gray-700 hover:text-indigo-600 transition">Items</button></li>
            {currentUser && (
              <>
                <li><button onClick={() => setPage('checkout')} className="text-gray-700 hover:text-indigo-600 transition">Cart</button></li>
                {currentUser.role === 'Admin' && (
                  <li><button onClick={() => setPage('admin')} className="text-gray-700 hover:text-indigo-600 transition">Admin</button></li>
                )}
                <li><span className="text-green-600">Hello, {currentUser.username}</span></li>
                <li><button onClick={() => { setPage('login'); }} className="text-red-600 hover:text-red-800 transition">Logout</button></li>
              </>
            )}
            {!currentUser && (
              <>
                <li><button onClick={() => setPage('login')} className="text-gray-700 hover:text-indigo-600 transition">Login</button></li>
                <li><button onClick={() => setPage('register')} className="text-gray-700 hover:text-indigo-600 transition">Register</button></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Django Shop. All rights reserved.
      </div>
    </footer>
  );
}

// Landing Page
function LandingPage({ items, setPage, setSelectedItem, currentUser }) {
  return (
    <>
      <section className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to Our Store</h2>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Discover our collection of amazing products. Browse, select, and enjoy!
        </p>
        <div className="mt-6">
          <button onClick={() => setPage('items')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Browse Items
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-6">Featured Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
              <img src={item.image_url || "https://placehold.co/400x250 "} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h4 className="text-lg font-semibold">{item.name}</h4>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
                <button onClick={() => { setSelectedItem(item); setPage('details'); }} className="mt-2 text-indigo-600 hover:underline">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// Item List Page
function ItemListPage({ items, setPage, setSelectedItem, addToCart }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">All Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <img src={item.image_url || "https://placehold.co/400x300 "} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="text-gray-600">${item.price.toFixed(2)}</p>
              <button onClick={() => { setSelectedItem(item); setPage('details'); }} className="mt-2 mr-2 text-indigo-600 hover:underline">
                View Details
              </button>
              <button onClick={() => addToCart(item)} className="mt-2 text-green-600 hover:underline">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Item Details Page
function ItemDetailsPage({ item, setPage, addToCart }) {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <img src={item.image_url || "https://placehold.co/600x400 "} alt={item.name} className="w-full h-64 object-cover rounded-lg mb-6" />
      <h2 className="text-3xl font-bold mb-4">{item.name}</h2>
      <p className="text-gray-700 mb-4">${item.price.toFixed(2)}</p>
      <p className="text-gray-600 mb-6">High-quality product with advanced features.</p>
      <div className="flex space-x-4">
        <button onClick={() => addToCart(item)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
          Add to Cart
        </button>
        <button onClick={() => setPage('items')} className="text-indigo-600 hover:underline">
          ← Back to Items
        </button>
      </div>
    </div>
  );
}

// Login Page
function LoginPage({ handleLogin, setPage }) {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" id="username" name="username" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" id="password" name="password" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">Login</button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{' '}
        <button onClick={() => setPage('register')} className="text-indigo-600 hover:underline">Register</button>
      </p>
    </div>
  );
}

// Register Page
function RegisterPage({ handleRegister, setPage, otpSent, setOtpSent }) {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" id="username" name="username" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" id="password" name="password" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {otpSent && (
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
            <input type="text" id="otp" name="otp" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
          {otpSent ? 'Confirm Registration' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <button onClick={() => setPage('login')} className="text-indigo-600 hover:underline">Login</button>
      </p>
    </div>
  );
}

// Checkout Page
function CheckoutPage({ cart, removeFromCart, applyVoucher, setPage }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6">Checkout</h2>
      {cart.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:underline">Remove</button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between">
              <strong>Subtotal:</strong>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <strong>Total:</strong>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mb-6">
            <form onSubmit={(e) => { e.preventDefault(); applyVoucher(e.target.voucherCode.value); }}>
              <label htmlFor="voucherCode" className="block text-sm font-medium text-gray-700 mb-1">Apply Voucher</label>
              <div className="flex">
                <input type="text" id="voucherCode" name="voucherCode" className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition">Apply</button>
              </div>
            </form>
          </div>
          <button onClick={() => setPage('thankyou')} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">Place Order</button>
        </>
      )}
    </div>
  );
}

// Thank You Page
function ThankYouPage({ setPage }) {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
      <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
      <p className="text-gray-700 mb-6">Your order has been placed successfully. We'll notify you when it ships.</p>
      <button onClick={() => setPage('home')} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Back to Home</button>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard({ users, deleteUser, setPage, currentUser }) {
  if (!currentUser || currentUser.role !== 'Admin') {
    return <div className="text-center py-16 text-red-600">Access Denied</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">User Management</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Username</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b">
                <td className="py-2 px-4">{user.id}</td>
                <td className="py-2 px-4">{user.username}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6">
        <button onClick={() => setPage('voucher')} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Manage Vouchers</button>
      </div>
    </div>
  );
}

// Voucher Page
function VoucherPage({ vouchers, setVouchers, setPage }) {
  const handleAddVoucher = (e) => {
    e.preventDefault();
    const code = e.target.code.value;
    const discount = parseFloat(e.target.discount.value);
    setVouchers([...vouchers, { code, discount }]);
    e.target.reset();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Voucher Management</h2>
      <form onSubmit={handleAddVoucher} className="mb-6">
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Voucher Code</label>
          <input type="text" id="code" name="code" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="mb-4">
          <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
          <input type="number" id="discount" name="discount" min="0" max="100" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">Add Voucher</button>
      </form>
      <div>
        <h3 className="text-lg font-semibold mb-2">Current Vouchers</h3>
        <ul className="space-y-2">
          {vouchers.map((v, idx) => (
            <li key={idx} className="bg-gray-100 p-2 rounded">
              {v.code} - {v.discount}% off
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <button onClick={() => setPage('admin')} className="text-indigo-600 hover:underline">← Back to Admin</button>
      </div>
    </div>
  );
}