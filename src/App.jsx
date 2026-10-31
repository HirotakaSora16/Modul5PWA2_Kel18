import { useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Catalog from './pages/Catalog.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CreateGunPage from './pages/CreateGunPage.jsx'
import EditGunPage from './pages/EditGunPage.jsx'
import GunDetail from './components/gun/GunDetail.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import gunService from './services/gunService.js'
import './App.css'

function App() {
  const [cart, setCart] = useState([]) // Menampung item persenjataan yang dipilih
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit' | 'detail'
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Unified navigation handler
  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Detail') {
      setSelectedGun(payload)
      setMode('detail')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Tab change
      setTab(target)
      setMode('list')
      setSelectedGun(null)
      setEditingGun(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedGun(null)
    setEditingGun(null)
  }

  // Fungsi untuk menambah item ke keranjang
  const addToCart = (gunItem) => {
    // Cek apakah senjata sudah ada di keranjang agar tidak double
    const isExist = cart.some(item => item.id === gunItem.id)
    if (isExist) {
      alert(`${gunItem.name} sudah ada di dalam keranjang!`)
      return
    }
    setCart([...cart, gunItem])
    alert(`${gunItem.name} berhasil ditambahkan ke keranjang.`)
  }

  // Fungsi Checkout otomatis mengarah ke WhatsApp pribadi Anda
  const handleCheckoutWhatsApp = () => {
    if (cart.length === 0) {
      alert('Keranjang Anda masih kosong! Silakan pilih senjata terlebih dahulu.')
      return
    }

    // Nomor WhatsApp pribadi Anda
    const nomorWA = "6281290969052" 

    // Susun daftar item yang dibeli dari array cart
    const listBarang = cart.map((item, index) => `${index + 1}. ${item.name} [Type: ${item.type || 'Weapon'}]`).join('\n')

    // Rangkai format pesan sesuai dengan instruksi dari asisten praktikum
    const teksPesan = `Hi aku mau pesan:\n\n${listBarang}\n\nMohon segera diproses ya, terima kasih!`

    // Perbaikan URL API WhatsApp resmi agar redirect berjalan lancar
    const urlWhatsApp = `https://whatsapp.com{nomorWA}&text=${encodeURIComponent(teksPesan)}`

    // Bersihkan keranjang setelah checkout
    setCart([])

    // Buka WhatsApp di tab baru
    window.open(urlWhatsApp, '_blank')
  }

  return (
    <div className="shell">
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
      />

      <main className="main">
        {/* Sub-page views */}
        {mode === 'create' && (
          <CreateGunPage
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setTab('Catalog')
            }}
          />
        )}

        {mode === 'edit' && (
          <EditGunPage
            gun={editingGun}
            gunId={editingGun?.id}
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setTab('Catalog')
            }}
          />
        )}

        {mode === 'detail' && selectedGun && (
          <GunDetail
            gun={selectedGun}
            onBack={handleBackToList}
            onEdit={(g) => handleNavigate('Edit', g)}
            onDelete={(g) => setDeleteTarget(g)}
            onAddToCart={addToCart}
          />
        )}

        {/* Top-level Tabs */}
        {mode === 'list' && (
          <>
            {/* Visual Panel Keranjang Taktis */}
            {cart.length > 0 && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#111317', border: '1px solid var(--brass)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ color: 'var(--brass)', margin: 0, fontWeight: 'bold' }}>
                    🛒 Tactical Cart ({cart.length} Item)
                  </h3>
                  <button 
                    onClick={() => setCart([])} 
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}
                  >
                    Kosongkan
                  </button>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#ccc' }}>
                  {cart.map((item) => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                      <span>• {item.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>({item.type || 'Weapon'})</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleCheckoutWhatsApp}
                  className="btn btn--primary"
                  style={{ width: '100%', display: 'block', textAlign: 'center', backgroundColor: '#25D366', color: '#fff', borderColor: '#25D366', fontWeight: 'bold' }}
                >
                  💬 Hubungi WA Pribadi untuk Checkout
                </button>
              </div>
            )}

            {tab === 'Catalog' && (
              <Catalog
                onNavigate={(destination, payload) => handleNavigate(destination, payload)}
              />
            )}
            {tab === 'Favorites' && (
              <FavoritesPage
                onSelectGun={(g) => handleNavigate('Detail', g)}
                onNavigateCatalog={() => setTab('Catalog')}
              />
            )}
            {tab === 'Profile' && (
              <ProfilePage onReplaySplash={() => setShowSplash(true)} />
            )}
            {tab === 'About' && <About />}
            {tab === 'Contact' && <Contact />}
          </>
        )}
      </main>

      {/* Global Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Hardware Record"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            setDeleting(true)
            await gunService.deleteGun(deleteTarget.id)
            setDeleteTarget(null)
            handleBackToList()
            setTab('Catalog')
          } catch (err) {
            alert(err.message || 'Failed to delete record.')
          } finally {
            setDeleting(false)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App
