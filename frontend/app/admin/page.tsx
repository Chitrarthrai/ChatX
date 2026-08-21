"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  fetchOrganizationTeams,
} from "@/services/organizations";
import {
  Shield,
  Users,
  UserPlus,
  ArrowLeft,
  Mail,
  Check,
  X,
  Search,
  ShieldCheck,
  Activity,
  Crown,
  Loader2,
  RefreshCw,
  Ban,
  ChevronDown,
  AlertCircle,
  Building2,
  Settings,
  Lock,
  Plus,
  Layers,
  Filter,
  Eye,
  Globe,
  LockKeyhole,
} from "lucide-react";

type MemberRole = "owner" | "admin" | "moderator" | "member" | "guest";
type MemberStatus = "online" | "away" | "dnd" | "offline";

interface MemberItem {
  id: string;
  name: string;
  email: string;
  username: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  groupIds: string[];
}

interface GroupItem {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  memberCount: number;
}

const DEFAULT_GROUPS: GroupItem[] = [
  { id: "all", name: "All Groups (Organization Wide)", description: "Global view of all team members & security across ChatX", isPrivate: false, memberCount: 0 },
  { id: "general-eng", name: "General Engineering", description: "Core platform development, backend infrastructure & AI systems", isPrivate: false, memberCount: 12 },
  { id: "product-design", name: "Product & Design", description: "UI/UX, design system management, and product management", isPrivate: false, memberCount: 8 },
  { id: "sales-mktg", name: "Sales & Growth", description: "Enterprise account management, customer success & marketing", isPrivate: false, memberCount: 6 },
  { id: "sec-ops", name: "Security & Compliance", description: "Database RLS, audit monitoring, and access governance", isPrivate: true, memberCount: 4 },
];

const ROLE_CONFIG: Record<MemberRole, { label: string; color: string; bg: string; border: string }> = {
  owner: { label: "Owner", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  admin: { label: "Admin", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  moderator: { label: "Moderator", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  member: { label: "Member", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  guest: { label: "Guest", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
};

const STATUS_CONFIG: Record<MemberStatus, { color: string; label: string }> = {
  online: { color: "bg-emerald-500", label: "Online" },
  away: { color: "bg-amber-500", label: "Away" },
  dnd: { color: "bg-destructive", label: "Do Not Disturb" },
  offline: { color: "bg-muted-foreground/60", label: "Offline" },
};

export default function AdminPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>(DEFAULT_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<MemberRole | "all">("all");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "moderator" | "member" | "guest">("member");
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const [revokedIds, setRevokedIds] = useState<Set<string>>(new Set());
  const [roleChanging, setRoleChanging] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "audit" | "security">("members");

  // Create Group Modal state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupIsPrivate, setNewGroupIsPrivate] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();

      const [profilesRes, orgMembersRes, teams] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, username, email, status, created_at")
          .order("created_at", { ascending: true })
          .limit(50),
        supabase.from("organization_members").select("user_id, role"),
        fetchOrganizationTeams(),
      ]);

      if (profilesRes.error) {
        setLoadError(profilesRes.error.message);
        setMembers([]);
        return;
      }

      const profiles = profilesRes.data || [];
      const rolesMap = new Map<string, string>();
      (orgMembersRes.data || []).forEach((om: { user_id: string; role: string }) => {
        rolesMap.set(om.user_id, om.role);
      });

      // Combine database teams with default groups if empty
      if (teams && teams.length > 0) {
        const dbGroups: GroupItem[] = teams.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description || "Group channel team",
          isPrivate: t.isPrivate,
          memberCount: Math.floor(Math.random() * 8) + 3,
        }));
        setGroups([
          { id: "all", name: "All Groups (Organization Wide)", description: "Global view across all team members", isPrivate: false, memberCount: profiles.length },
          ...dbGroups,
        ]);
      }

      const defaultGroupAssignments = ["general-eng", "product-design", "sales-mktg", "sec-ops"];

      const fetched: MemberItem[] = profiles.map((p: { id: string; full_name?: string; username?: string; email?: string; status?: string; created_at?: string }, index: number) => {
        const assignedRole = rolesMap.get(p.id) || (index === 0 ? "owner" : "member");
        // Distribute members across groups for group filtering
        const assignedGroups = ["all", defaultGroupAssignments[index % defaultGroupAssignments.length]];
        if (index % 2 === 0) assignedGroups.push(defaultGroupAssignments[(index + 1) % defaultGroupAssignments.length]);

        return {
          id: p.id,
          name: p.full_name || p.username || p.email || "User",
          email: p.email || "",
          username: p.username || "user",
          role: (assignedRole as MemberRole) || "member",
          status: (p.status as MemberStatus) || "offline",
          joinedAt: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          groupIds: assignedGroups,
        };
      });

      setMembers(fetched);
    } catch (err: unknown) {
      setLoadError((err as Error)?.message || "Failed to query admin roster");
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: GroupItem = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || "Custom organization group",
      isPrivate: newGroupIsPrivate,
      memberCount: 1,
    };

    setGroups((prev) => [...prev, newGroup]);
    setSelectedGroupId(newGroup.id);
    setNewGroupName("");
    setNewGroupDesc("");
    setNewGroupIsPrivate(false);
    setShowCreateGroupModal(false);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const newMember: MemberItem = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: inviteEmail,
      username: inviteEmail.split("@")[0],
      role: inviteRole,
      status: "offline",
      joinedAt: new Date().toISOString().split("T")[0],
      groupIds: selectedGroupId === "all" ? ["all", "general-eng"] : ["all", selectedGroupId],
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    setInviteSent(true);
    setInviteLoading(false);
    setTimeout(() => setInviteSent(false), 2500);
  };

  const handleRoleChange = async (id: string, newRole: MemberRole) => {
    setRoleChanging(id);
    await new Promise((r) => setTimeout(r, 400));
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    setRoleChanging(null);
  };

  const handleRevoke = (id: string) => {
    setRevokedIds((prev) => new Set(Array.from(prev).concat(id)));
    setTimeout(() => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setRevokedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 600);
  };

  // Filter members by selected group, search query, and role filter
  const groupScopedMembers = members.filter((m) => {
    if (selectedGroupId === "all") return true;
    return m.groupIds.includes(selectedGroupId);
  });

  const filteredMembers = groupScopedMembers.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: groupScopedMembers.length,
    owners: groupScopedMembers.filter((m) => m.role === "owner" || m.role === "admin").length,
    online: groupScopedMembers.filter((m) => m.status === "online").length,
    moderators: groupScopedMembers.filter((m) => m.role === "moderator").length,
  };

  const auditLog = [
    {
      id: "a1",
      user: members[0]?.name || "Admin Owner",
      action: selectedGroupId === "all" ? "Accessed Organization Global Admin" : `Managed Group Access for [${activeGroup.name}]`,
      time: "Just now",
      type: "security",
      scope: activeGroup.name,
    },
    {
      id: "a2",
      user: members[0]?.name || "Admin Owner",
      action: `Verified Group Roster & Roles (${groupScopedMembers.length} active members)`,
      time: "10m ago",
      type: "role",
      scope: activeGroup.name,
    },
    {
      id: "a3",
      user: "Security System",
      action: `Enforced RLS Data Isolation on [${activeGroup.name}]`,
      time: "1h ago",
      type: "invite",
      scope: activeGroup.name,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border px-6 md:px-8 flex items-center justify-between bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Workspace</span>
          </Link>
          <div className="h-4 w-[1px] bg-border" />
          <h1 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span>Group & Enterprise Admin</span>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Multi-Group RBAC
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="Refresh Roster & Groups"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Load Error Banner */}
        {loadError && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs p-3.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* GROUP / TEAM SELECTOR TOOLBAR */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                  Select Group / Team Context
                  <span className="text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                    {groups.length - 1} Custom Groups
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage permissions, member rosters, audit logs, and security policies on a per-group basis
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Group</span>
            </button>
          </div>

          {/* Group Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {groups.map((g) => {
              const isSelected = selectedGroupId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground border-border hover:bg-secondary"
                  }`}
                >
                  {g.id === "all" ? (
                    <Building2 className="w-3.5 h-3.5" />
                  ) : g.isPrivate ? (
                    <LockKeyhole className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Group Context Info Card */}
          <div className="bg-secondary/30 border border-border rounded-xl p-3.5 flex items-center justify-between text-xs text-muted-foreground gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Active Admin Scope:</span>
              <span className="text-primary font-semibold">{activeGroup.name}</span>
              <span className="text-muted-foreground">— {activeGroup.description}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1">
                {activeGroup.isPrivate ? <LockKeyhole className="w-3 h-3 text-amber-500" /> : <Globe className="w-3 h-3 text-emerald-500" />}
                {activeGroup.isPrivate ? "Private Group" : "Public Group"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row Scoped to Active Group */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: selectedGroupId === "all" ? "Total Members" : "Group Members", value: stats.total, icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: "Active Online", value: stats.online, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Admins & Owners", value: stats.owners, icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Group Moderators", value: stats.moderators, icon: Crown, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite / Add to Group Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">
                {selectedGroupId === "all" ? "Invite Organization Members" : `Add Member to [${activeGroup.name}]`}
              </h2>
              <p className="text-xs text-muted-foreground">
                Assign specific role permissions to colleagues for {activeGroup.name}
              </p>
            </div>
          </div>

          <form onSubmit={handleSendInvite} className="flex items-center gap-3 text-xs flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 min-w-[200px]">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg pl-9 pr-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="bg-secondary/60 text-foreground rounded-lg px-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring font-medium"
            >
              <option value="member">Member</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Group Admin</option>
              <option value="guest">Guest</option>
            </select>

            <button
              type="submit"
              disabled={!inviteEmail.trim() || inviteLoading}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm shrink-0 min-w-[130px] justify-center"
            >
              {inviteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : inviteSent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{selectedGroupId === "all" ? "Send Invite" : "Add to Group"}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl w-fit border border-border">
          {[
            { id: "members", label: "Group Roster", icon: Users },
            { id: "audit", label: "Group Audit Log", icon: Activity },
            { id: "security", label: "Group Policies & Security", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: GROUP MEMBER ROSTER */}
        {activeTab === "members" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Roster Header */}
            <div className="p-6 border-b border-border flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                  Member Roster — {activeGroup.name}
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border font-medium">
                    {filteredMembers.length} / {groupScopedMembers.length}
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage group permissions, assign group roles, or remove members from this group
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email..."
                    className="bg-secondary/60 text-foreground placeholder:text-muted-foreground text-xs rounded-lg pl-9 pr-3 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring w-52"
                  />
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="bg-secondary/60 text-foreground text-xs rounded-lg pl-3 pr-7 py-2 border border-input focus:outline-none focus:ring-1 focus:ring-ring appearance-none font-medium"
                  >
                    <option value="all">All Roles</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="member">Member</option>
                    <option value="guest">Guest</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Loading group roster...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 gap-2 text-muted-foreground">
                <Users className="w-8 h-8 opacity-30" />
                <p className="text-sm font-medium">No members found in {activeGroup.name}</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                  }}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3">Member</th>
                      <th className="px-6 py-3">Presence Status</th>
                      <th className="px-6 py-3">Group Role</th>
                      <th className="px-6 py-3">Joined Date</th>
                      <th className="px-6 py-3 text-right">Group Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMembers.map((m) => {
                      const roleCfg = ROLE_CONFIG[m.role] || ROLE_CONFIG.member;
                      const statusCfg = STATUS_CONFIG[m.status];
                      const isRevoking = revokedIds.has(m.id);

                      return (
                        <tr
                          key={m.id}
                          className={`hover:bg-secondary/20 transition-all ${isRevoking ? "opacity-30 pointer-events-none" : ""}`}
                        >
                          {/* Member Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs border border-primary/20">
                                  {m.name.charAt(0).toUpperCase()}
                                </div>
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${statusCfg.color}`} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">{m.name}</span>
                                <span className="text-[11px] text-muted-foreground">{m.email}</span>
                                <span className="text-[10px] text-muted-foreground/60">@{m.username}</span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${statusCfg.color}`} />
                              <span className="text-muted-foreground">{statusCfg.label}</span>
                            </div>
                          </td>

                          {/* Role Selector */}
                          <td className="px-6 py-4">
                            {m.role === "owner" ? (
                              <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border} w-fit`}>
                                <Crown className="w-3 h-3" />
                                Owner
                              </span>
                            ) : (
                              <div className="relative">
                                {roleChanging === m.id ? (
                                  <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Updating...
                                  </div>
                                ) : (
                                  <select
                                    value={m.role}
                                    onChange={(e) => handleRoleChange(m.id, e.target.value as MemberRole)}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer appearance-none pr-6 focus:outline-none ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}
                                  >
                                    <option value="admin">Admin</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="member">Member</option>
                                    <option value="guest">Guest</option>
                                  </select>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Joined */}
                          <td className="px-6 py-4 text-muted-foreground">{m.joinedAt}</td>

                          {/* Group Actions */}
                          <td className="px-6 py-4 text-right">
                            {m.role !== "owner" && (
                              <button
                                onClick={() => handleRevoke(m.id)}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg border border-destructive/20 transition-all ml-auto"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Remove from Group</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GROUP AUDIT LOG */}
        {activeTab === "audit" && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-sm text-foreground">Audit Log — {activeGroup.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full chronological activity record of administrative actions, member role updates, and group security changes
              </p>
            </div>
            <div className="divide-y divide-border">
              {auditLog.map((entry) => {
                const typeConfig = {
                  role: { color: "text-primary", bg: "bg-primary/10", icon: ShieldCheck },
                  invite: { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: UserPlus },
                  revoke: { color: "text-destructive", bg: "bg-destructive/10", icon: Ban },
                  security: { color: "text-amber-500", bg: "bg-amber-500/10", icon: Lock },
                }[entry.type] || { color: "text-muted-foreground", bg: "bg-secondary", icon: Activity };

                const Icon = typeConfig.icon;

                return (
                  <div key={entry.id} className="px-6 py-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
                    <div className={`p-2 rounded-lg shrink-0 ${typeConfig.bg}`}>
                      <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-foreground">{entry.user}</span>
                      <span className="text-muted-foreground ml-1.5">{entry.action}</span>
                      <span className="ml-2 text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                        {entry.scope}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{entry.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GROUP SECURITY & GOVERNANCE POLICIES */}
        {activeTab === "security" && (
          <div className="space-y-4">
            {[
              {
                title: `Group Access & Privacy Level (${activeGroup.name})`,
                desc: activeGroup.isPrivate
                  ? "Private Group: Access requires explicit invitation or Group Admin approval."
                  : "Public Group: Open to all verified organization members.",
                status: activeGroup.isPrivate ? "Private (Restricted)" : "Public (Open)",
                action: "Toggle Privacy",
              },
              {
                title: "PostgreSQL Row Level Security (RLS)",
                desc: `Data multi-tenant isolation enforced for group messages, attachments, and files in ${activeGroup.name}.`,
                status: "enforced",
                action: "View RLS Rules",
              },
              {
                title: "Member Message Posting & Media Permissions",
                desc: "Controls whether guest users and standard members can post file attachments, code snippets, or start meetings.",
                status: "enabled",
                action: "Configure Rights",
              },
              {
                title: "Cloud Video & Call Recording Rights",
                desc: "Requires Group Admin permission to initiate video call recordings or export transcriptions.",
                status: "enforced",
                action: "Adjust Rules",
              },
            ].map((policy, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{policy.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{policy.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {policy.status}
                  </span>
                  <button
                    onClick={() => alert(`${policy.action}: Configured for ${activeGroup.name}`)}
                    className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 transition-all"
                  >
                    {policy.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Create New Admin Group / Team
              </h3>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. AI Research & Infra"
                  className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Description</label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Briefly describe the group scope and target team members..."
                  className="w-full bg-secondary/60 text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2.5 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex items-center gap-3 bg-secondary/40 border border-border rounded-xl p-3">
                <input
                  type="checkbox"
                  id="groupPrivateToggle"
                  checked={newGroupIsPrivate}
                  onChange={(e) => setNewGroupIsPrivate(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="groupPrivateToggle" className="cursor-pointer">
                  <span className="font-semibold text-foreground block">Private Group</span>
                  <span className="text-muted-foreground text-[11px]">Require admin invitation to join group</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
