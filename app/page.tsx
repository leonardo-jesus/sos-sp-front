"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Car,
  Clock,
  Droplets,
  Flame,
  Heart,
  Home,
  MapPin,
  Phone,
  Plus,
  Search,
  Users,
  Wind,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

type CategoryData = {
  icon: React.ReactNode;
  color: string;
  label: string;
}

type Post = {
  id: number;
  author: string;
  content: string;
  address: string;
  cep: string;
  phone: string;
  timestamp: string;
  category: string;
  urgent: boolean;
  image: string | null;
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`http://localhost:3001/api/posts?page=${page}`);
      const data = await res.json();

      const formattedPosts = data.map((post: any) => ({
        id: post.id,
        author: post.title,
        content: post.content,
        address: `${post.address}, ${post.number} - ${post.neighborhood}, ${post.city} - ${post.state}`,
        cep: post.cep,
        phone: post.phone,
        timestamp: new Date(post.createdAt).toLocaleString("pt-BR"),
        category: post.category,
        urgent: post.category !== "help",
        image: post.imageUrl ? `http://localhost:3001/${post.imageUrl}` : null,
        createdAt: post.createdAt,
      }));

      if (page === 1) {
        setPosts(formattedPosts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...formattedPosts]);
      }
    };

    fetchPosts();
  }, [page]);

  const getCategoryData = (category: string): CategoryData => {
    switch (category) {
      case "flood":
        return {
          icon: <Droplets className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-800",
          label: "Alagamento"
        }
      case "fire":
        return {
          icon: <Flame className="w-4 h-4" />,
          color: "bg-red-100 text-red-800",
          label: "Incêndio"
        }
      case "landslide":
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: "bg-orange-100 text-orange-800",
          label: "Deslizamento"
        }
      case "help":
        return {
          icon: <Heart className="w-4 h-4" />,
          color: "bg-green-100 text-green-800",
          label: "Ajuda"
        }
      case "rescue":
        return {
          icon: <Users className="w-4 h-4" />,
          color: "bg-purple-100 text-purple-800",
          label: "Resgate"
        }
      case "structural":
        return {
          icon: <Home className="w-4 h-4" />,
          color: "bg-yellow-100 text-yellow-800",
          label: "Estrutural"
        }
      case "traffic":
        return {
          icon: <Car className="w-4 h-4" />,
          color: "bg-gray-100 text-gray-800",
          label: "Trânsito"
        }
      case "power":
        return {
          icon: <Zap className="w-4 h-4" />,
          color: "bg-indigo-100 text-indigo-800",
          label: "Energia"
        }
      case "storm":
        return {
          icon: <Wind className="w-4 h-4" />,
          color: "bg-cyan-100 text-cyan-800",
          label: "Tempestade"
        }
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: "bg-gray-100 text-gray-800",
          label: "Emergência"
        }
    }
  }

  const getCardColor = (post: Post) => {
    if (post.urgent) {
      return "border-red-200 bg-red-50";
    }
    if (post.category === "help") {
      return "border-green-200 bg-green-50";
    }
    return "";
  }

  const filteredPosts = posts.filter((post: Post) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      post.content.toLowerCase().includes(searchLower) ||
      post.address.toLowerCase().includes(searchLower) ||
      post.author.toLowerCase().includes(searchLower) ||
      getCategoryData(post.category).label.toLowerCase().includes(searchLower)
    );
  });

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
              <a href="https://www.defesacivil.sp.gov.br/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium">
                Defesa Civil
              </a>
              <a href="https://www.policiacivil.sp.gov.br/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium">
                Polícia Civil
              </a>
              <a href="https://www.corpodebombeiros.sp.gov.br/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 font-medium">
                Corpo de Bombeiros
              </a>
              <Link href="/post">
                <Button className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Postar
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-100 rounded-lg p-6 mb-8">
          <p className="text-gray-800 text-center leading-relaxed">
            Bem-vindo ao portal de auxílio para pessoas em situação de risco no Estado de São Paulo, especialmente em
            momentos de alagamentos, deslizamentos e outras emergências que impactam nossa população. Este espaço foi
            criado para promover a solidariedade e a responsabilidade coletiva. As publicações aqui realizadas são
            visíveis a todos os usuários, incluindo a Defesa Civil, órgãos municipais e estaduais, além de voluntários e
            equipes de resgate. Utilize este canal com seriedade e empatia para informar, pedir ajuda ou oferecer apoio.
            Juntos, podemos salvar vidas e reconstruir com dignidade.
          </p>
        </div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Feed de Publicações</h2>
          <p className="text-gray-600">
            Acompanhe as situações de emergência em tempo real e ofertas de ajuda da comunidade.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Pesquisar postagens por localização, tipo de emergência..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card 
              key={`${post.id}-${post.createdAt}`} 
              className={getCardColor(post)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {post.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.author}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryData(post.category).color}>
                      <div className="flex items-center space-x-1">
                        {getCategoryData(post.category).icon}
                        <span>{getCategoryData(post.category).label}</span>
                      </div>
                    </Badge>
                    {post.urgent && (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Urgente
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.image && (
                  <div className="mb-4">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Imagem da emergência"
                      className="w-full max-w-md h-64 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{post.address}</span>
                    </div>
                    <span>•</span>
                    <span>CEP: {post.cep}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>Contato: {post.phone}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href={`https://wa.me/55${post.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline">
                      <Phone className="w-3 h-3 mr-1" />
                      Entrar em contato
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" onClick={() => setPage(prev => prev + 1)}>
            Carregar Mais Publicações
          </Button>
        </div>
      </main>
    </div>
  )
}
