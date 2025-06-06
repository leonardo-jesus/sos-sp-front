"use client"

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle,
  Droplets,
  Flame,
  Heart,
  Home,
  MapPin,
  Upload,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface FormData {
  name: string
  content: string
  category: string
  phone: string
  cep: string
  address: string
  number: string
  neighborhood: string
  city: string
  state: string
  file: File | null
}

interface FormErrors {
  name?: string
  content?: string
  category?: string
  phone?: string
  cep?: string
  address?: string
  number?: string
}

interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export default function PostPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    content: "",
    category: "",
    phone: "",
    cep: "",
    address: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    file: null,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)

  const emergencyCategories = [
    { value: "flood", label: "Alagamento", icon: Droplets },
    { value: "fire", label: "Incêndio", icon: Flame },
    { value: "landslide", label: "Deslizamento", icon: AlertTriangle },
    { value: "help", label: "Oferecendo Ajuda", icon: Heart },
    { value: "rescue", label: "Resgate Necessário", icon: Users },
    { value: "structural", label: "Problema Estrutural", icon: Home },
    { value: "traffic", label: "Problema de Trânsito", icon: Car },
    { value: "power", label: "Falta de Energia", icon: Zap },
    { value: "storm", label: "Vendaval/Tempestade", icon: Wind },
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.content.trim()) {
      newErrors.content = "Descrição da situação é obrigatória"
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "Descrição deve ter pelo menos 10 caracteres"
    }

    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório"
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Telefone deve estar no formato (11) 99999-9999"
    }

    if (!formData.cep.trim()) {
      newErrors.cep = "CEP é obrigatório"
    } else if (!/^\d{5}-?\d{3}$/.test(formData.cep)) {
      newErrors.cep = "CEP deve estar no formato 00000-000"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Endereço é obrigatório"
    }

    if (!formData.number.trim()) {
      newErrors.number = "Número é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file }))

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) {
      return numbers
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value)
    handleInputChange("cep", formatted)

    if (formatted.length === 9) {
      setIsLoadingCEP(true)
      try {
        const cleanCEP = formatted.replace("-", "")
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        const data: ViaCEPResponse = await response.json()

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }))

          setErrors((prev) => ({
            ...prev,
            address: undefined,
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      } finally {
        setIsLoadingCEP(false)
      }
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    handleInputChange("phone", formatted)
  }

  const getLocationFromBrowser = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador")
      return
    }

    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const mockAddress = {
            cep: "01310-100",
            address: "Av. Paulista",
            number: "1000",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
          }

          setFormData((prev) => ({
            ...prev,
            cep: mockAddress.cep,
            address: mockAddress.address,
            number: mockAddress.number,
            neighborhood: mockAddress.neighborhood,
            city: mockAddress.city,
            state: mockAddress.state,
          }))

          setErrors((prev) => ({
            ...prev,
            cep: undefined,
            address: undefined,
          }))
        } catch (error) {
          alert("Erro ao obter endereço da localização")
        } finally {
          setIsLoadingLocation(false)
        }
      },
      (error) => {
        setIsLoadingLocation(false)
        alert("Erro ao obter localização: " + error.message)
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    const data = new FormData()

    data.append("title", formData.name)
    data.append("content", formData.content)
    data.append("category", formData.category)
    data.append("phone", formData.phone)
    data.append("cep", formData.cep)
    data.append("address", formData.address)
    data.append("number", formData.number)
    data.append("neighborhood", formData.neighborhood)
    data.append("city", formData.city)
    data.append("state", formData.state)
    if (formData.file) data.append("image", formData.file)

    try {
      const response = await fetch("http://localhost:3001/api/posts", {
        method: "POST",
        body: data,
      })

      if (!response.ok) throw new Error("Erro ao criar publicação")

      setIsSuccess(true)
      setFormData({
        name: "",
        content: "",
        category: "",
        phone: "",
        cep: "",
        address: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        file: null,
      })
      setImagePreview(null)
    } catch (err) {
      console.error(err)
      alert("Erro ao enviar publicação")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Publicação Enviada!</h2>
              <p className="text-gray-600">
                Sua publicação foi enviada com sucesso e está sendo analisada pelas autoridades competentes.
              </p>
              <Link href="/">
                <Button className="w-full">Voltar ao Feed</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/sp.png"
                  alt="SP Icon"
                  width={48}
                  height={48}
                  className="object-scale-down w-full h-full"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">S.O.S - SP</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
                Defesa Civil
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
                Polícia Civil
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
                Corpo de Bombeiros
              </a>
              <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
                Feed
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Feed
          </Link>
        </div>
        <div className="bg-blue-100 rounded-lg p-6 mb-8">
          <p className="text-gray-800 text-center leading-relaxed">
            Use este formulário para reportar situações de emergência, solicitar ajuda ou oferecer apoio à comunidade.
            Seja preciso nas informações de localização para facilitar o atendimento. Suas informações serão visíveis
            para autoridades competentes e voluntários.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Nova Publicação</CardTitle>
              <p className="text-gray-600">
                Preencha as informações abaixo para reportar uma situação de emergência ou oferecer ajuda.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Seu Nome *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Digite seu nome completo"
                    className={`w-full ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone para Contato *
                  </label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={`w-full ${errors.phone ? "border-red-500" : ""}`}
                    maxLength={15}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria da Emergência *
                </label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={`w-full ${errors.category ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Selecione o tipo de emergência" />
                  </SelectTrigger>
                  <SelectContent>
                    {emergencyCategories.map((category) => {
                      const Icon = category.icon
                      return (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Situação *
                </label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Descreva detalhadamente a situação de emergência, tipo de ajuda necessária ou apoio oferecido..."
                  className={`w-full min-h-[120px] resize-none ${errors.content ? "border-red-500" : ""}`}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
              </div>
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  Anexar Foto ou Documento (Opcional)
                </label>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Upload className="w-5 h-5" />
                        <span>Clique para escolher arquivo ou arraste aqui</span>
                      </div>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full max-w-sm h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null)
                          setFormData((prev) => ({ ...prev, file: null }))
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Localização</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getLocationFromBrowser}
                    disabled={isLoadingLocation}
                    className="flex items-center space-x-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{isLoadingLocation ? "Obtendo..." : "Usar Minha Localização"}</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                      CEP *
                    </label>
                    <div className="relative">
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => handleCEPChange(e.target.value)}
                        placeholder="00000-000"
                        className={`w-full ${errors.cep ? "border-red-500" : ""}`}
                        maxLength={9}
                      />
                      {isLoadingCEP && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                    </div>
                    {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep}</p>}
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço *
                    </label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Nome da rua"
                      className={`w-full ${errors.address ? "border-red-500" : ""}`}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                      Número *
                    </label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => handleInputChange("number", e.target.value)}
                      placeholder="123"
                      className={`w-full ${errors.number ? "border-red-500" : ""}`}
                    />
                    {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                      placeholder="Bairro"
                      className="w-full"
                      readOnly={isLoadingCEP}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Cidade"
                      className="w-full"
                      readOnly={isLoadingCEP}
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="UF"
                      className="w-full"
                      maxLength={2}
                      readOnly={isLoadingCEP}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                  {isSubmitting ? "Publicando..." : "Publicar Emergência"}
                </Button>
                <Link href="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
