'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function ComponentsShowcase() {
  const t = useTranslations('components');
  const tButtons = useTranslations('components.buttons');
  const tForms = useTranslations('components.forms');
  const tCards = useTranslations('components.cards');
  const tAvatars = useTranslations('components.avatars');
  const tColors = useTranslations('components.colorPalette');
  const tStatus = useTranslations('components.status');

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-4xl font-bold">🎨 {t('title')}</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Buttons Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{tButtons('title')}</h2>
            <p className="text-muted-foreground text-sm">
              Primary uses Cerulean Blue, Destructive uses Jasper Red
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">{tButtons('default')}</Button>
                <Button variant="secondary">{tButtons('secondary')}</Button>
                <Button variant="destructive">{tButtons('destructive')}</Button>
                <Button variant="outline">{tButtons('outline')}</Button>
                <Button variant="ghost">{tButtons('ghost')}</Button>
                <Button variant="link">{tButtons('link')}</Button>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Forms Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{tForms('title')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{tForms('loginTitle')}</CardTitle>
                <CardDescription>{tForms('loginSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder={tForms('emailPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder={tForms('passwordPlaceholder')} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">{tForms('loginButton')}</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tForms('profileTitle')}</CardTitle>
                <CardDescription>{tForms('profileSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder={tForms('namePlaceholder')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder={tForms('bioPlaceholder')}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">{tForms('saveButton')}</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Cards & Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{tCards('title')}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tCards('forum.title')}</CardTitle>
                  <Badge>125 {tCards('forum.posts')}</Badge>
                </div>
                <CardDescription>{tCards('forum.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Join thousands of students to share knowledge and exchange experiences.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Forum</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tCards('documents.title')}</CardTitle>
                  <Badge variant="secondary">847 {tCards('documents.count')}</Badge>
                </div>
                <CardDescription>{tCards('documents.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Access a diverse library of textbooks, lectures, and exams shared by the community.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Browse Documents
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tCards('jobs.title')}</CardTitle>
                  <Badge variant="destructive">32 {tCards('jobs.new')}</Badge>
                </div>
                <CardDescription>{tCards('jobs.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Discover internship and job opportunities matching your field of study.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">
                  View Jobs
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Avatars & Dialog */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{tAvatars('title')}</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{tAvatars('default')}</p>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>NV</AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">{tAvatars('fallback')}</p>
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">{tAvatars('large')}</p>
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">UV</AvatarFallback>
                  </Avatar>
                </div>

                <Separator orientation="vertical" className="h-20" />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Dialog</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>{tAvatars('openDialog')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{tAvatars('dialogTitle')}</DialogTitle>
                        <DialogDescription>
                          {tAvatars('dialogDescription')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline">{tAvatars('dialogCancel')}</Button>
                        <Button variant="destructive">{tAvatars('dialogContinue')}</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{tColors('title')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{tColors('cerulean')}</CardTitle>
                <CardDescription>#124874</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                    <div
                      key={shade}
                      className={`h-12 rounded-md bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground`}
                      style={{ backgroundColor: `var(--color-primary-${shade}, #124874)` }}
                    >
                      {shade}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tColors('jasper')}</CardTitle>
                <CardDescription>#CF373D</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                    <div
                      key={shade}
                      className={`h-12 rounded-md bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground`}
                      style={{ backgroundColor: `var(--color-accent-${shade}, #CF373D)` }}
                    >
                      {shade}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Status */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">
              ✅ {tStatus('title')} - {tStatus('completed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                ✓ Shadcn UI components configured (Button, Card, Input, Label, Badge, Avatar,
                Dialog, Separator)
              </li>
              <li>✓ Custom Cerulean Blue (#124874) & Jasper Red (#CF373D) colors integrated</li>
              <li>✓ Dark mode support with ThemeToggle</li>
              <li>✓ Radix UI primitives installed</li>
              <li>✓ Component showcase page created</li>
              <li>✓ All components styled with UniHub color palette</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
