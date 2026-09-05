import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import SearchPage from './pages/SearchPage'
import MedicineDetailPage from './pages/MedicineDetailPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/medicine/:id" element={<MedicineDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
