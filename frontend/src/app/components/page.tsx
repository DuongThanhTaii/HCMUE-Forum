import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export default function ComponentsShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              🎨 UniHub Component Showcase
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Shadcn UI với Cerulean Blue #124874 & Jasper Red #CF373D
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Buttons Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Buttons</h2>
            <p className="text-sm text-muted-foreground">Primary sử dụng Cerulean Blue, Destructive sử dụng Jasper Red</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
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
          <h2 className="text-2xl font-semibold">Forms</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Login Form</CardTitle>
                <CardDescription>Nhập email và mật khẩu của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="student@unihub.edu.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Hủy</Button>
                <Button>Đăng nhập</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input id="name" placeholder="Nguyễn Văn A" defaultValue="Nguyễn Văn A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Sinh viên năm 3..." defaultValue="Sinh viên ĐHSP TPHCM" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Lưu thay đổi</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Cards & Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cards & Badges</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Diễn đàn</CardTitle>
                  <Badge>125 bài viết</Badge>
                </div>
                <CardDescription>Thảo luận với cộng đồng sinh viên</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Tham gia cùng hàng nghìn sinh viên để chia sẻ kiến thức, giải đáp thắc mắc và trao đổi kinh nghiệm học tập.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Xem diễn đàn</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tài liệu học tập</CardTitle>
                  <Badge variant="secondary">847 tài liệu</Badge>
                </div>
                <CardDescription>Kho tài liệu phong phú</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Truy cập thư viện tài liệu đa dạng từ giáo trình, bài giảng đến đề thi các môn học, được chia sẻ bởi cộng đồng.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Tìm tài liệu</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Việc làm</CardTitle>
                  <Badge variant="destructive">32 việc mới</Badge>
                </div>
                <CardDescription>Cơ hội nghề nghiệp</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Khám phá các cơ hội thực tập và việc làm phù hợp với chuyên ngành, được cập nhật liên tục từ doanh nghiệp.</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">Xem việc làm</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Avatars & Dialog */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Avatars & Dialogs</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Default Avatar</p>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>NV</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fallback Avatar</p>
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Large Avatar</p>
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">UV</AvatarFallback>
                  </Avatar>
                </div>

                <Separator orientation="vertical" className="h-20" />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Dialog Example</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Mở Dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Xác nhận hành động</DialogTitle>
                        <DialogDescription>
                          Bạn có chắc chắn muốn thực hiện hành động này không? Hành động này không thể hoàn tác.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline">Hủy</Button>
                        <Button variant="destructive">Xác nhận</Button>
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
          <h2 className="text-2xl font-semibold">UniHub Color Palette</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Primary - Cerulean Blue</CardTitle>
                <CardDescription>#124874</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                    <div
                      key={shade}
                      className={`h-12 rounded-md bg-primary-${shade} flex items-center justify-center text-xs font-medium`}
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
                <CardTitle>Accent - Jasper Red</CardTitle>
                <CardDescription>#CF373D</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                    <div
                      key={shade}
                      className={`h-12 rounded-md bg-accent-${shade} flex items-center justify-center text-xs font-medium`}
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
            <CardTitle className="text-primary">✅ TASK-102: GAIA UI + Shadcn Setup - HOÀN THÀNH</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Shadcn UI components configured (Button, Card, Input, Label, Badge, Avatar, Dialog, Separator)</li>
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
  )
}
