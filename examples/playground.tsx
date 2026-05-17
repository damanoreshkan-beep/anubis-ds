// CSS load order matters: variables :root must come before utility
// classes that reference them, and theme.css uses those variables.
import '../dist/variables.css'
import '../dist/theme.css'
import '../dist/animations.css'
import './playground.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import {
    Accordion, AccordionItem, AccordionTrigger, AccordionContent,
    Avatar, AvatarImage, AvatarFallback,
    Badge,
    Button,
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    Input,
    Label,
    NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
    ScrollArea,
    Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose,
    Skeleton,
    Tabs, TabsList, TabsTrigger, TabsContent,
    Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
    Toaster, toast,
} from '../src'
import { Home, Settings, User, ChevronDown, Heart, Star } from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3 border-t border-border pt-8">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">{title}</h2>
            <div className="flex flex-wrap gap-4 items-start">{children}</div>
        </section>
    )
}

function App() {
    return (
        <TooltipProvider>
            <Toaster />
            <div className="min-h-screen p-8 max-w-5xl mx-auto space-y-8">
                <header className="flex items-baseline justify-between">
                    <h1 className="text-4xl font-bold">
                        Anubis <span className="gold-text">Design System</span>
                    </h1>
                    <Badge variant="outline">v1.1.0</Badge>
                </header>
                <p className="text-muted-foreground">
                    Live playground for every component shipped from <code>@anubis/ds</code>.
                    Tokens come from <code>tokens.json</code>; styling is Tailwind + CSS vars.
                </p>

                <Section title="Buttons">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="brand" size="xl">PLAY</Button>
                    <Button size="sm"><Heart /> With icon</Button>
                </Section>

                <Section title="Card">
                    <Card className="w-80">
                        <CardHeader>
                            <CardTitle>Tier — Premium</CardTitle>
                            <CardDescription>Recurring monthly support tier</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">150 ₴ <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="brand" className="w-full">Subscribe</Button>
                        </CardFooter>
                    </Card>
                </Section>

                <Section title="Dialog & Sheet">
                    <Dialog>
                        <DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm action</DialogTitle>
                                <DialogDescription>This will overwrite your skin. Continue?</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                <Button>Confirm</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Sheet>
                        <SheetTrigger asChild><Button variant="outline">Open side sheet</Button></SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Quick menu</SheetTitle>
                                <SheetDescription>Slide-in nav drawer using the Sheet primitive.</SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-3 py-4">
                                <Button variant="ghost" className="justify-start"><Home /> Home</Button>
                                <Button variant="ghost" className="justify-start"><User /> Profile</Button>
                                <Button variant="ghost" className="justify-start"><Settings /> Settings</Button>
                            </div>
                            <SheetClose asChild><Button className="mt-4">Close</Button></SheetClose>
                        </SheetContent>
                    </Sheet>
                </Section>

                <Section title="Tabs">
                    <Tabs defaultValue="profile" className="w-80">
                        <TabsList>
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="skin">Skin</TabsTrigger>
                            <TabsTrigger value="cape">Cape</TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile" className="rounded-md border border-border bg-card p-4">
                            <p className="text-sm">Profile tab — change nick, email.</p>
                        </TabsContent>
                        <TabsContent value="skin" className="rounded-md border border-border bg-card p-4">
                            <p className="text-sm">Skin upload + 3D preview.</p>
                        </TabsContent>
                        <TabsContent value="cape" className="rounded-md border border-border bg-card p-4">
                            <p className="text-sm">Cape upload.</p>
                        </TabsContent>
                    </Tabs>
                </Section>

                <Section title="Dropdown menu">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Account <ChevronDown /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem><User /> Profile</DropdownMenuItem>
                            <DropdownMenuItem><Settings /> Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Sign out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Section>

                <Section title="Navigation menu">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Modpack</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid gap-3 p-6 w-80">
                                        <NavigationMenuLink className="block text-sm">HiTech 1.12.2</NavigationMenuLink>
                                        <NavigationMenuLink className="block text-sm">66 mods</NavigationMenuLink>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink className="px-4 py-2 text-sm hover:bg-accent rounded-md">Server</NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </Section>

                <Section title="Form bits">
                    <div className="grid gap-2 w-72">
                        <Label htmlFor="nick">Minecraft nick</Label>
                        <Input id="nick" placeholder="Steve_123" />
                    </div>
                </Section>

                <Section title="Avatar + Badge">
                    <Avatar><AvatarImage src="https://mc-heads.net/avatar/TechBranch/64" /><AvatarFallback>TB</AvatarFallback></Avatar>
                    <Avatar><AvatarImage src="https://mc-heads.net/avatar/PixelArtist/64" /><AvatarFallback>PA</AvatarFallback></Avatar>
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">UA</Badge>
                    <Badge variant="destructive">Banned</Badge>
                </Section>

                <Section title="Accordion (FAQ)">
                    <Accordion type="single" collapsible className="w-full max-w-xl">
                        <AccordionItem value="q1">
                            <AccordionTrigger>How do I start playing?</AccordionTrigger>
                            <AccordionContent>Download the launcher, enter your nick, press PLAY.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="q2">
                            <AccordionTrigger>What's the modpack?</AccordionTrigger>
                            <AccordionContent>HiTech — IC2 + Thermal + AE2 stable on Forge 1.12.2.</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </Section>

                <Section title="Tooltip + Toast + Skeleton + ScrollArea">
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="outline"><Star /> Hover</Button></TooltipTrigger>
                        <TooltipContent>Adds to favorites</TooltipContent>
                    </Tooltip>
                    <Button onClick={() => toast.success('Skin uploaded', { description: 'Visible in-game on next login.' })}>
                        Fire toast
                    </Button>
                    <div className="space-y-2 w-60">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <ScrollArea className="h-32 w-48 rounded-md border border-border p-2 text-xs">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="py-1">Mod #{i + 1}</div>
                        ))}
                    </ScrollArea>
                </Section>

                <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
                    All components above are exported from <code>@anubis/ds</code>. Tokens at{' '}
                    <a className="text-primary underline" href="../tokens.json">tokens.json</a>.
                </footer>
            </div>
        </TooltipProvider>
    )
}

createRoot(document.getElementById('root')!).render(<App />)
