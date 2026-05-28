import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { Car } from '../types'
import { Language, translations } from '../translations'

interface CarModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (carData: {
    Manufacturer: string
    Model: string
    Year: number
    CarClass: string
    PI: number
    CarType: string
    Price: string | number
    isOwned: boolean
  }) => void
  car?: Car
  existingBrands?: string[]
  language: Language
}

export const CarModal: React.FC<CarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  car,
  existingBrands = [],
  language
}): React.JSX.Element | null => {
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [carClass, setCarClass] = useState('D')
  const [pi, setPi] = useState(100)
  const [carType, setCarType] = useState('autoshow, wheel')
  const [price, setPrice] = useState('')
  const [isOwned, setIsOwned] = useState(false)
  const t = translations[language]

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (car) {
      setManufacturer(car.Manufacturer || '')
      setModel(car.Model || '')
      setYear(car.Year || 2026)
      setCarClass(car.CarClass || 'D')
      setPi(car.PI || 100)
      setCarType(car.CarType || 'General')
      setPrice(car.originalRaw?.Price !== undefined ? car.originalRaw.Price : '')
      setIsOwned(car.originalRaw?.['Is own?'] === 'TRUE')
    } else {
      setManufacturer('')
      setModel('')
      setYear(2026)
      setCarClass('D')
      setPi(100)
      setCarType('autoshow, wheel')
      setPrice('')
      setIsOwned(false)
    }
  }, [car, isOpen])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!manufacturer.trim() || !model.trim()) {
      alert(t['CarModal.requiredAlert'])
      return
    }
    onSave({
      Manufacturer: manufacturer.trim(),
      Model: model.trim(),
      Year: Number(year),
      CarClass: carClass,
      PI: Number(pi),
      CarType: carType.trim(),
      Price: price,
      isOwned
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand-dark-border bg-brand-dark-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-brand-dark-hover hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-extrabold text-white tracking-tight mb-5">
          {car ? t['CarModal.editTitle'] : t['CarModal.addTitle']}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t['CarModal.manufacturer']}
              </label>
              <input
                type="text"
                list="brands"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder={t['CarModal.manufacturerPlaceholder']}
                className="w-full bg-brand-dark-input text-white text-sm rounded-xl px-3 py-2 border border-brand-dark-border focus:outline-none focus:border-brand-primary transition-colors"
                required
              />
              <datalist id="brands">
                {existingBrands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t['CarModal.model']}
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={t['CarModal.modelPlaceholder']}
                className="w-full bg-brand-dark-input text-white text-sm rounded-xl px-3 py-2 border border-brand-dark-border focus:outline-none focus:border-brand-primary transition-colors"
                required
              />
            </div>
          </div>

          {/* Year & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t['CarModal.year']}
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min="1900"
                max="2100"
                className="w-full bg-brand-dark-input text-white text-sm rounded-xl px-3 py-2 border border-brand-dark-border focus:outline-none focus:border-brand-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t['CarModal.price']}
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t['CarModal.pricePlaceholder']}
                className="w-full bg-brand-dark-input text-white text-sm rounded-xl px-3 py-2 border border-brand-dark-border focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          {/* Class & PI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t['CarModal.class']}
              </label>
              <select
                value={carClass}
                onChange={(e) => setCarClass(e.target.value)}
                className="w-full bg-brand-dark-input text-white text-sm rounded-xl px-3 py-2 border border-brand-dark-border focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
              >
                <option value="D">D</option>
                <option value="C">C</option>
                <option value="B">B</option>
                <option value="A">A</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="X">X</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t['CarModal.pi']}
              </label>
              <input
                type="number"
                value={pi}
                onChange={(e) => setPi(Number(e.target.value))}
                min="100"
                max="999"
                className="w-full bg-brand-dark-input text-white text-sm rounded-xl px-3 py-2 border border-brand-dark-border focus:outline-none focus:border-brand-primary transition-colors"
                required
              />
            </div>
          </div>

          {/* Source / Type */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              {t['CarModal.source']}
            </label>
            <input
              type="text"
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              placeholder={t['CarModal.sourcePlaceholder']}
              className="w-full bg-brand-dark-input text-white text-sm rounded-xl px-3 py-2 border border-brand-dark-border focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          {/* Is Own Switch */}
          <div className="flex items-center justify-between bg-brand-dark-input/40 p-3 rounded-xl border border-brand-dark-border">
            <div>
              <span className="text-sm font-bold text-white">{t['CarModal.isOwned']}</span>
              <p className="text-xs text-slate-400">{t['CarModal.isOwnedDesc']}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOwned(!isOwned)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isOwned ? 'bg-emerald-500' : 'bg-brand-dark-hover'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isOwned ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-brand-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-brand-dark-border bg-brand-dark-hover/50 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-brand-dark-hover hover:text-white transition-all cursor-pointer"
            >
              {t['CarModal.cancel']}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-primary-hover to-brand-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:from-brand-primary hover:to-brand-primary-light transition-all cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>{t['CarModal.save']}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
