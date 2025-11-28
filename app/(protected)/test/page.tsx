//homepage requires login
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUserAction, signoutAction } from "@/actions/auth-actions"
import { User } from "@supabase/supabase-js"
import { LogOut, Mail, Calendar } from "lucide-react"

export default function HomePage() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            const currentUser = await getCurrentUserAction()
            setUser(currentUser)
            setIsLoading(false)
        }
        loadUser()
    }, [])

    async function handleSignOut() {
        await signoutAction()
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-mutedForeground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-semibold font-serif text-foreground">
                            Welcome Back!
                        </h1>
                        <p className="text-mutedForeground mt-2">
                            You're successfully logged in to MathCraft
                        </p>
                    </div>
                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Account</CardTitle>
                        <CardDescription>
                            Your account information and details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-mutedForeground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-mutedForeground">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-mutedForeground" />
                            <div>
                                <p className="text-sm font-medium">Member Since</p>
                                <p className="text-sm text-mutedForeground">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-lg">Create Worksheet</CardTitle>
                            <CardDescription>
                                Start creating a new math worksheet
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-lg">My Worksheets</CardTitle>
                            <CardDescription>
                                View and manage your worksheets
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-lg">Settings</CardTitle>
                            <CardDescription>
                                Manage your account settings
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    )
}