import api from './api'
export const dossierService = {
  async create(data: any) { const response = await api.post('/dossiers', data); return response.data },
  async getMyDossiers() { const response = await api.get('/dossiers'); return response.data },
  async getOne(id: string) { const response = await api.get(`/dossiers/${id}`); return response.data },
  async updateStep(id: string, currentStep: number, formData?: any) { const response = await api.post(`/dossiers/${id}/step`, { currentStep, formData }); return response.data },
  async cancel(id: string) { const response = await api.patch(`/dossiers/${id}/cancel`); return response.data },
  async remove(id: string) { const response = await api.delete(`/dossiers/${id}`); return response.data },
  async calculatePrice(vehicleData: any, region: string) { const response = await api.post('/dossiers/public/calculate-price', { vehicleData, region }); return response.data }
}