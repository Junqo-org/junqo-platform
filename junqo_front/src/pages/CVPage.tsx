import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Upload, FileText, Sparkles, Loader2, TrendingUp, AlertCircle } from 'lucide-react'
import { apiService } from '@/services/api'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import * as pdfjsLib from 'pdfjs-dist'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function CVPage() {
  const [file, setFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState('')
  const [jobContext, setJobContext] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        setFile(selectedFile)
        setAnalysis(null)
        await extractTextFromPDF(selectedFile)
      }
    },
  })

  const extractTextFromPDF = async (pdfFile: File) => {
    setIsExtracting(true)
    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
        fullText += pageText + '\n\n'
      }

      setCvText(fullText.trim())
      toast.success(`Texte extrait avec succès ! (${pdf.numPages} pages)`)
    } catch (error) {
      console.error('PDF extraction error:', error)
      toast.error('Erreur lors de l\'extraction du texte PDF')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      toast.error('Veuillez d\'abord télécharger un CV')
      return
    }
    
    setIsAnalyzing(true)
    try {
      const result = await apiService.analyzeCvContent(
        cvText,
        jobContext || undefined
      )
      setAnalysis(result.recommendations)
      toast.success('Analyse terminée !')
    } catch (error: unknown) {
      console.error('CV analysis error:', error)
      toast.error('Erreur lors de l\'analyse du CV')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          Analyse de CV par IA
        </h1>
        <p className="text-muted-foreground text-lg">
          Obtenez des conseils professionnels pour améliorer votre CV
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Télécharger votre CV</CardTitle>
          <CardDescription>Format PDF uniquement • Extraction automatique du texte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <input {...getInputProps()} />
            {isExtracting ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                <p className="text-sm font-medium">Extraction du texte en cours...</p>
              </div>
            ) : file ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 mx-auto text-green-600" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Badge variant="secondary">
                  {cvText.length} caractères extraits
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive ? 'Déposez votre CV ici' : 'Glissez-déposez votre CV ou cliquez'}
                </p>
                <p className="text-xs text-muted-foreground">PDF uniquement, max 10 MB</p>
              </div>
            )}
          </div>

          {cvText && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Poste visé (optionnel)</Label>
                <Input
                  placeholder="ex: Développeur Full Stack, Chef de Projet..."
                  value={jobContext}
                  onChange={(e) => setJobContext(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Spécifiez un poste pour une analyse personnalisée
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyser mon CV
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="border-primary/50 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Analyse Détaillée
                </CardTitle>
                <CardDescription>
                  Recommandations personnalisées pour améliorer votre CV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setFile(null)
                  setCvText('')
                  setAnalysis(null)
                  setJobContext('')
                }}
                variant="outline"
                className="flex-1"
              >
                Analyser un autre CV
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {!analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Conseils pour un bon CV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ Gardez votre CV concis (1-2 pages max)</li>
              <li>✓ Utilisez des verbes d'action (développé, géré, optimisé...)</li>
              <li>✓ Quantifiez vos résultats (chiffres, pourcentages)</li>
              <li>✓ Adaptez votre CV pour chaque poste</li>
              <li>✓ Vérifiez l'orthographe et la grammaire</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

