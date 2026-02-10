'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublicChannels } from '@/hooks/api/chat/usePublicChannels';
import { useMyChannels } from '@/hooks/api/chat/useMyChannels';
import { useJoinChannel } from '@/hooks/api/chat/useJoinChannel';
import { Link } from '@/lib/i18n/routing';
import { Users, Hash, Loader2, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function ChannelsPage() {
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('public');
  const { data: publicChannels, isLoading: loadingPublic } = usePublicChannels();
  const { data: myChannels, isLoading: loadingMy } = useMyChannels();
  const joinChannelMutation = useJoinChannel();

  const handleJoinChannel = (channelId: string) => {
    joinChannelMutation.mutate(channelId);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kênh trò chuyện</h1>
        <p className="text-muted-foreground mt-1">
          Tham gia các kênh công khai và trò chuyện với mọi người
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'public'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Kênh công khai
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'my'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Kênh của tôi
          </button>
        </div>

        {activeTab === 'public' && (
          <>
            {loadingPublic && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {publicChannels && publicChannels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không có kênh công khai nào</p>
              </div>
            )}

            {publicChannels && publicChannels.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicChannels.map((channel) => (
                  <Card key={channel.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{channel.name}</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {channel.memberCount}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {channel.description || 'Không có mô tả'}
                      </p>

                      <div className="text-xs text-muted-foreground">
                        Tạo bởi: {channel.createdBy.fullName}
                      </div>

                      <Button
                        onClick={() => handleJoinChannel(channel.id)}
                        disabled={joinChannelMutation.isPending}
                        className="w-full"
                      >
                        Tham gia kênh
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'my' && (
          <>
            {loadingMy && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {myChannels && myChannels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Bạn chưa tham gia kênh nào</p>
              </div>
            )}

            {myChannels && myChannels.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChannels.map((channel) => (
                  <Card key={channel.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {channel.description || 'Không có mô tả'}
                      </p>

                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/chat?channel=${channel.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Mở kênh
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
