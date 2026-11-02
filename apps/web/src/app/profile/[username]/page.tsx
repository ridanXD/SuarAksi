"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Building2,
  Phone,
  Globe,
  ArrowBigUp,
  FileText,
  Repeat2,
  Image as ImageIcon,
  MessageSquare,
  Edit3,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportCard } from "@/components/report/ReportCard";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "replies" | "reposts" | "media">("posts");
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;

    setIsLoading(true);
    api.get<any>(`/profiles/${username}`)
      .then((data) => {
        setProfile(data);
        setIsFollowing(data.isFollowing || false);
        setFollowersCount(data.stats?.followersCount || 0);
      })
      .catch(() => setProfile(null))
      .finally(() => setIsLoading(false));
  }, [username]);

  useEffect(() => {
    if (!username) return;

    setIsLoadingActivity(true);
    api.get<any>(`/profiles/${username}/activity?tab=${activeTab}`)
      .then((data) => setActivities(data.items || []))
      .catch(() => setActivities([]))
      .finally(() => setIsLoadingActivity(false));
  }, [username, activeTab]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await api.post(`/profiles/${profile.id}/follow`);
    } catch {
      setIsFollowing(!nextState);
      setFollowersCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-16 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-red-600">Pengguna tidak ditemukan</p>
          <Button size="sm" onClick={() => router.push("/feed")}>
            Kembali ke Beranda
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isInstance = profile.role === "INSTANCE";

  return (
    <AppLayout>
      <div className="border-b border-surface-200 bg-white">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <Avatar
              src={profile.avatarUrl}
              name={profile.instanceProfile?.instanceName || profile.name}
              size="xl"
              className="border-2 border-white shadow-md"
            />

            <div className="flex gap-2">
              {isOwnProfile ? (
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profil</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "primary"}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Mengikuti" : "Ikuti"}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg font-black text-surface-900">
                  {profile.instanceProfile?.instanceName || profile.name}
                </h1>
                {profile.isVerified && <VerifiedBadge size={18} />}
              </div>
              <p className="text-xs text-surface-500">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-surface-700 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-surface-500">
              {isInstance && profile.instanceProfile?.jurisdiction && (
                <span className="flex items-center gap-1 text-surface-700 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-crimson-600" />
                  <span>{profile.instanceProfile.jurisdiction}</span>
                </span>
              )}
              {isInstance && profile.instanceProfile?.categoryFocus && (
                <span className="flex items-center gap-1 text-surface-700 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Fokus: {profile.instanceProfile.categoryFocus}</span>
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{profile.phone}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Bergabung {formatDate(profile.createdAt)}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2 text-xs">
              <span className="text-surface-700">
                <strong className="text-surface-900 font-bold">{followersCount}</strong> Pengikut
              </span>
              <span className="text-surface-700">
                <strong className="text-surface-900 font-bold">
                  {profile.stats?.followingCount || 0}
                </strong>{" "}
                Mengikuti
              </span>
              <span className="text-surface-700 flex items-center gap-1">
                <ArrowBigUp className="w-4 h-4 text-crimson-600 fill-crimson-600" />
                <span>
                  <strong className="text-surface-900 font-bold">
                    {profile.stats?.totalUpsReceived || 0}
                  </strong>{" "}
                  UP Diterima
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex border-t border-surface-200">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "posts"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Laporan ({profile.stats?.reportsCount || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("replies")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "replies"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tanggapan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reposts")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "reposts"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <Repeat2 className="w-4 h-4" />
            <span>Repost</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === "media"
                ? "border-crimson-600 text-surface-900"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media</span>
          </button>
        </div>
      </div>

      <div>
        {isLoadingActivity ? (
          <div>
            <Skeleton className="h-32 w-full m-4" />
            <Skeleton className="h-32 w-full m-4" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Belum Ada Aktivitas"
              description="Pengguna ini belum memiliki aktivitas pada tab yang dipilih."
            />
          </div>
        ) : (
          <div>
            {activities.map((item) => {
              if (activeTab === "replies") {
                return (
                  <div
                    key={item.id}
                    className="p-4 border-b border-surface-200 bg-white space-y-2 hover:bg-surface-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <span>Menanggapi laporan:</span>
                      <Link
                        href={`/reports/${item.report?.id}`}
                        className="font-bold text-surface-900 hover:underline line-clamp-1"
                      >
                        "{item.report?.title}"
                      </Link>
                    </div>
                    <p className="text-xs text-surface-800 leading-relaxed bg-surface-50 p-3 rounded border border-surface-200">
                      {item.content}
                    </p>
                  </div>
                );
              }

              return <ReportCard key={item.id} report={item} />;
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
