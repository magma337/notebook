import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string, error?: string }> }) {
    const params = await searchParams
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Mini NotebookLM</CardTitle>
                    <CardDescription className="text-center">
                        Upload files and get AI-powered summaries
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form id="login-form">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            {params?.error && (
                                <p className="text-sm font-medium text-red-500 text-center">{params.error}</p>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button className="w-full" formAction={login} form="login-form">Log in</Button>
                    <Button className="w-full" variant="outline" formAction={signup} form="login-form">Sign up</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
