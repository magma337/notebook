'use client';

import { useState } from 'react';
import { summarizeYoutubeVideo } from './actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Youtube, Sparkles } from 'lucide-react';

export default function YoutubeSummaryPage() {
    const [url, setUrl] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');
        setSummary('');

        try {
            const res = await summarizeYoutubeVideo(url);
            if (res.success && res.data) {
                setSummary(res.data);
            } else {
                setError(res.error || "요약에 실패했습니다.");
            }
        } catch (err) {
            setError("알 수 없는 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <div className="space-y-6 text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl flex items-center justify-center gap-2">
                    <Youtube className="text-red-500 w-10 h-10" />
                    YouTube 동영상 요약
                </h1>
                <p className="text-muted-foreground text-lg">
                    영상 URL만 입력하면 AI가 핵심 내용을 요약해줍니다.
                </p>
            </div>

            <Card className="p-6 mb-8 shadow-lg border-2">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full text-lg p-6"
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={loading || !url}
                        className="h-auto font-semibold text-lg px-8 py-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                분석 중...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                요약하기
                            </>
                        )}
                    </Button>
                </form>
            </Card>

            {error && (
                <div className="p-4 mb-6 rounded-md bg-destructive/15 text-destructive font-medium border border-destructive/20 text-center">
                    {error}
                </div>
            )}

            {loading && (
                <Card className="w-full shadow-md animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            )}

            {summary && !loading && (
                <Card className="w-full shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500 border-primary/20">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Sparkles className="w-5 h-5" />
                            요약 결과
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                            {summary}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
