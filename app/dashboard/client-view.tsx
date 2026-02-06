'use client'

import { useState } from 'react'
import { uploadAndSummarize, deleteSummary, logout } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, FileText, Trash2, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Summary {
    id: string
    file_name: string
    file_type: string
    summary_text: string
    created_at: string
}

export default function DashboardClient({ initialSummaries }: { initialSummaries: Summary[] }) {
    const [isUploading, setIsUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Note: For a real app, we'd use optimistic updates or router.refresh(), 
    // but since we revalidatePath in action, router.refresh() or just waiting is fine.
    // We'll rely on the server component re-rendering the list, which means we might want
    // to trigger a router refresh manually if the server action doesn't automatically trigger a client update in a way we like.
    // Actually Next.js Server Actions + revalidatePath usually handle this.

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0])
        }
    }

    const handleUpload = async (file: File) => {
        setIsUploading(true)
        setError(null)
        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadAndSummarize(formData)

        setIsUploading(false)
        if (result.error) {
            setError(result.error)
        }
        // No need to manually refresh if revalidatePath is working, but safety net:
        // router.refresh(); 
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this summary?')) {
            await deleteSummary(id)
        }
    }

    const handleLogout = async () => {
        await logout()
        window.location.href = '/login'
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            N
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                            Mini NotebookLM
                        </h1>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Upload Section */}
                <section>
                    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <CardContent
                            className={`flex flex-col items-center justify-center py-12 px-4 transition-colors ${dragActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                                ) : (
                                    <Upload className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {isUploading ? 'Analyzing File...' : 'Upload a file to summarize'}
                            </h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                                Drag and drop your PDF, Image, or Video here, or click to browse.
                                (Supported: PDF, JPG, PNG, MP4, etc.)
                            </p>

                            <div className="relative">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleChange}
                                    disabled={isUploading}
                                />
                                <Button asChild disabled={isUploading} variant={isUploading ? "secondary" : "default"}>
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        Choose File
                                    </label>
                                </Button>
                            </div>

                            {error && (
                                <p className="mt-4 text-sm font-medium text-red-500">{error}</p>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Results Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Summaries</h2>

                    {initialSummaries.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No summaries yet. Upload a file to get started!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {initialSummaries.map((summary) => (
                                <Card key={summary.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-md">
                                                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base line-clamp-1" title={summary.file_name}>
                                                        {summary.file_name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        {new Date(summary.created_at).toLocaleDateString()}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                onClick={() => handleDelete(summary.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-4">
                                        <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-6 text-muted-foreground">
                                            {/* Simple markdown rendering or standard text */}
                                            {summary.summary_text}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button variant="secondary" size="sm" className="w-full" onClick={() => alert(summary.summary_text)}>
                                            View Full Summary
                                        </Button>
                                        {/* In a real app, this would open a modal or go to a detail page */}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    )
}
