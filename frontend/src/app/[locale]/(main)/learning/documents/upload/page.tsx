'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploader } from '@/components/shared/FileUploader';
import { useUploadDocument } from '@/hooks/api/learning/useUploadDocument';
import { useFaculties } from '@/hooks/api/learning/useFaculties';
import { useCourses } from '@/hooks/api/learning/useCourses';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import { documentSchema } from '@/lib/validations/document.schema';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentType } from '@/types/api/learning.types';

export default function UploadDocumentPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    documentType: '' as DocumentType | '',
    facultyId: '',
    courseId: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: faculties } = useFaculties();
  const { data: coursesData } = useCourses({ facultyId: formData.facultyId });
  const uploadDocumentMutation = useUploadDocument();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Vui lòng chọn file tài liệu');
      return;
    }

    if (!formData.courseId || !formData.documentType) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      // Validate form data
      documentSchema.parse({
        title: formData.title,
        description: formData.description,
        documentType: formData.documentType,
        courseId: formData.courseId,
      });

      setIsUploading(true);

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file, {
        folder: 'unihub/documents',
        resource_type: 'raw',
      });

      // Submit document metadata
      await uploadDocumentMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        documentType: formData.documentType as DocumentType,
        courseId: formData.courseId,
        fileUrl: uploadResult.secure_url,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
      });

      router.push('/learning/documents');
    } catch (error: any) {
      if (error.message?.includes('cloudinary')) {
        toast.error('Không thể tải file lên. Vui lòng thử lại.');
      } else if (error.errors) {
        toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tải lên tài liệu</CardTitle>
          <p className="text-muted-foreground text-sm">
            Chia sẻ tài liệu học tập với cộng đồng sinh viên
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề tài liệu"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Mô tả <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả nội dung tài liệu"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                maxLength={2000}
              />
              <p className="text-muted-foreground text-xs">
                {formData.description.length}/2000 ký tự
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Khoa <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.facultyId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, facultyId: value, courseId: '' })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties?.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Môn học <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                  disabled={!formData.facultyId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesData?.items.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Loại tài liệu <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, documentType: value as DocumentType })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại tài liệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lecture">Bài giảng</SelectItem>
                  <SelectItem value="Assignment">Bài tập</SelectItem>
                  <SelectItem value="Exam">Đề thi</SelectItem>
                  <SelectItem value="Reference">Tài liệu tham khảo</SelectItem>
                  <SelectItem value="Other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                File tài liệu <span className="text-destructive">*</span>
              </Label>
              <FileUploader value={file} onChange={setFile} disabled={isUploading} />
            </div>

            <div className="bg-muted/50 text-muted-foreground rounded-lg border p-4 text-sm">
              <p className="mb-2 font-medium">Lưu ý:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Tài liệu sẽ được kiểm duyệt trước khi công khai</li>
                <li>Chỉ tải lên tài liệu học tập hợp lệ</li>
                <li>Không tải lên tài liệu có bản quyền</li>
                <li>Kích thước file tối đa: 10MB</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button type="submit" disabled={isUploading || !file} className="flex-1">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  'Tải lên'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isUploading}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
