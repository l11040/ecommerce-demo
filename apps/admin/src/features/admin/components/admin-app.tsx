'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  FolderTree,
  LayoutDashboard,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCcw,
  Settings,
} from 'lucide-react';
import {
  create,
  list,
  login,
  me,
  refresh,
  setMainExposure,
  update,
  type BoLoginDto,
  type CreateCategoryDto,
  type List200DataItem,
  type UpdateCategoryDto,
} from '@/api/bo';
import { Button } from '@/components/ui/button';
import fetcher from '@/lib/fetcher';

type LoginState = {
  username: string;
  password: string;
};

type CategoryFormState = {
  name: string;
  slug: string;
  parentId: string;
  sortOrder: string;
  isActive: boolean;
  isVisible: boolean;
  isMainExposed: boolean;
};

type AdminMenuKey = 'dashboard' | 'categories' | 'products' | 'settings';

const defaultCategoryForm: CategoryFormState = {
  name: '',
  slug: '',
  parentId: '',
  sortOrder: '0',
  isActive: true,
  isVisible: true,
  isMainExposed: false,
};

const menuLabels: Record<AdminMenuKey, string> = {
  dashboard: '대시보드',
  categories: '카테고리 설정',
  products: '상품 관리',
  settings: '설정',
};

export function AdminApp() {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');

  const [loginState, setLoginState] = useState<LoginState>({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginPending, setLoginPending] = useState(false);

  const [categories, setCategories] = useState<List200DataItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');

  const [createForm, setCreateForm] = useState<CategoryFormState>(defaultCategoryForm);
  const [createPending, setCreatePending] = useState(false);
  const [createMessage, setCreateMessage] = useState('');

  const [editDrafts, setEditDrafts] = useState<Record<number, CategoryFormState>>({});
  const [updatePendingId, setUpdatePendingId] = useState<number | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [logoutPending, setLogoutPending] = useState(false);

  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('categories');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const parentCandidates = useMemo(
    () => categories.filter((category) => category.depth < 4),
    [categories],
  );

  async function bootstrapAuth() {
    setAuthLoading(true);

    const meResponse = await me();
    if (meResponse.status === 200 && meResponse.data.success) {
      setCurrentUsername(meResponse.data.data.username);
      setIsAuthenticated(true);
      setAuthLoading(false);
      return;
    }

    if (meResponse.status === 401) {
      const refreshResponse = await refresh();
      if (refreshResponse.status === 200 && refreshResponse.data.success) {
        const retryMeResponse = await me();
        if (retryMeResponse.status === 200 && retryMeResponse.data.success) {
          setCurrentUsername(retryMeResponse.data.data.username);
          setIsAuthenticated(true);
        }
      }
    }

    setAuthLoading(false);
  }

  async function loadCategories() {
    setCategoriesLoading(true);
    setCategoriesError('');

    const response = await list();
    if (response.status !== 200 || !response.data.success) {
      setCategoriesError(response.data.message ?? '카테고리 조회에 실패했습니다.');
      setCategoriesLoading(false);
      return;
    }

    setCategories(response.data.data);
    setEditDrafts(
      response.data.data.reduce<Record<number, CategoryFormState>>((acc, category) => {
        acc[category.id] = {
          name: category.name,
          slug: category.slug,
          parentId: category.parentId ? String(category.parentId) : '',
          sortOrder: String(category.sortOrder),
          isActive: category.isActive,
          isVisible: category.isVisible,
          isMainExposed: category.isMainExposed,
        };
        return acc;
      }, {}),
    );
    setCategoriesLoading(false);
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoginPending(true);
    setLoginError('');

    const payload: BoLoginDto = {
      username: loginState.username.trim(),
      password: loginState.password,
    };

    const response = await login(payload);
    if (response.status !== 200 || !response.data.success) {
      setLoginPending(false);
      setLoginError(response.data.message ?? '로그인에 실패했습니다.');
      return;
    }

    const meResponse = await me();
    if (meResponse.status === 200 && meResponse.data.success) {
      setCurrentUsername(meResponse.data.data.username);
      setIsAuthenticated(true);
    } else {
      setLoginError('로그인은 성공했지만 사용자 정보를 불러오지 못했습니다.');
    }

    setLoginPending(false);
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreatePending(true);
    setCreateMessage('');

    const payload: CreateCategoryDto = {
      name: createForm.name.trim(),
      slug: createForm.slug.trim(),
      sortOrder: Number(createForm.sortOrder || '0'),
      isActive: createForm.isActive,
      isVisible: createForm.isVisible,
      isMainExposed: createForm.isMainExposed,
    };

    if (createForm.parentId.trim()) {
      payload.parentId = Number(createForm.parentId);
    }

    const response = await create(payload);
    if (response.status !== 200 || !response.data.success) {
      setCreateMessage(response.data.message ?? '카테고리 생성에 실패했습니다.');
      setCreatePending(false);
      return;
    }

    setCreateMessage('카테고리가 생성되었습니다.');
    setCreateForm(defaultCategoryForm);
    setCreatePending(false);
    await loadCategories();
  }

  async function handleUpdateCategory(categoryId: number) {
    const draft = editDrafts[categoryId];
    if (!draft) {
      return;
    }

    setUpdatePendingId(categoryId);
    setUpdateMessage('');

    const payload: UpdateCategoryDto = {
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      sortOrder: Number(draft.sortOrder || '0'),
      isActive: draft.isActive,
      isVisible: draft.isVisible,
      isMainExposed: draft.isMainExposed,
    };

    const response = await update(categoryId, payload);
    if (response.status !== 200 || !response.data.success) {
      setUpdateMessage(response.data.message ?? '카테고리 수정에 실패했습니다.');
      setUpdatePendingId(null);
      return;
    }

    setUpdateMessage(`카테고리 #${categoryId}가 저장되었습니다.`);
    setUpdatePendingId(null);
    await loadCategories();
  }

  async function handleMainExposureToggle(categoryId: number, nextValue: boolean) {
    setUpdatePendingId(categoryId);
    setUpdateMessage('');

    const response = await setMainExposure(categoryId, { isMainExposed: nextValue });
    if (response.status !== 200 || !response.data.success) {
      setUpdateMessage(response.data.message ?? '메인 노출 상태 변경에 실패했습니다.');
      setUpdatePendingId(null);
      return;
    }

    setUpdateMessage(`카테고리 #${categoryId} 메인 노출이 변경되었습니다.`);
    setUpdatePendingId(null);
    await loadCategories();
  }

  async function handleLogout() {
    setLogoutPending(true);

    await fetcher('/bo/auth/logout', {
      method: 'POST',
    });

    setIsAuthenticated(false);
    setCurrentUsername('');
    setCategories([]);
    setEditDrafts({});
    setActiveMenu('categories');
    setLogoutPending(false);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void bootstrapAuth();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-900">
        <p className="text-sm tracking-wide">관리자 인증 상태를 확인하는 중입니다...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900">
        <section className="mx-auto grid min-h-screen w-full max-w-[1280px] overflow-hidden md:grid-cols-2">
          <div className="relative hidden bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 p-16 text-slate-900 md:flex md:flex-col md:justify-between">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute left-10 top-14 h-40 w-40 rounded-full bg-white/70 blur-2xl" />
              <div className="absolute bottom-12 right-10 h-52 w-52 rounded-full bg-cyan-100 blur-2xl" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Ecommerce Admin</p>
              <h1 className="mt-4 text-4xl font-black leading-tight">
                운영 지표와 카테고리
                <br />
                관리를 한 곳에서
              </h1>
            </div>
            <p className="relative z-10 max-w-md text-sm font-semibold leading-relaxed">
              백오피스 로그인은 일반 아이디/비밀번호 방식만 지원합니다. 소셜 로그인은 제공하지 않습니다.
            </p>
          </div>

          <div className="flex items-center justify-center px-6 py-12 md:px-16">
            <form
              className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
              onSubmit={handleLoginSubmit}
            >
              <div>
                <h2 className="text-2xl font-bold">Admin Login</h2>
                <p className="mt-2 text-sm text-slate-500">아이디와 비밀번호를 입력하세요.</p>
              </div>

              <label className="block space-y-2">
                <span className="text-sm text-slate-700">아이디</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-400 transition focus:ring-2"
                  value={loginState.username}
                  onChange={(event) => {
                    setLoginState((prev) => ({ ...prev, username: event.target.value }));
                  }}
                  placeholder="username"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-slate-700">비밀번호</span>
                <input
                  type="password"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-400 transition focus:ring-2"
                  value={loginState.password}
                  onChange={(event) => {
                    setLoginState((prev) => ({ ...prev, password: event.target.value }));
                  }}
                  placeholder="password"
                  autoComplete="current-password"
                  required
                />
              </label>

              {loginError ? <p className="text-sm font-medium text-rose-400">{loginError}</p> : null}

              <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={loginPending}>
                {loginPending ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  const isCategoriesMenu = activeMenu === 'categories';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-slate-200 bg-white transition-all md:flex md:flex-col ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div
          className={`border-b border-slate-200 px-4 py-4 ${
            sidebarCollapsed ? 'flex justify-center' : 'flex items-center justify-between'
          }`}
        >
          {!sidebarCollapsed ? (
            <div className="overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Ecommerce</p>
              <h2 className="mt-1 text-base font-semibold">Admin Dashboard</h2>
            </div>
          ) : null}
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {[
            { key: 'dashboard', label: '대시보드', icon: LayoutDashboard },
            { key: 'categories', label: '카테고리 관리', icon: FolderTree },
            { key: 'products', label: '상품 관리', icon: Layers },
            { key: 'settings', label: '설정', icon: Settings },
          ].map((menu) => {
            const Icon = menu.icon;
            const isActive = activeMenu === menu.key;

            return (
              <button
                key={menu.key}
                type="button"
                onClick={() => setActiveMenu(menu.key as AdminMenuKey)}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                  sidebarCollapsed ? 'justify-center' : 'gap-2'
                } ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={menu.label}
              >
                <Icon className="size-4 shrink-0" />
                {!sidebarCollapsed ? <span>{menu.label}</span> : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-4 py-4">
          {!sidebarCollapsed ? <p className="text-xs text-slate-500">로그인 사용자</p> : null}
          {sidebarCollapsed ? (
            <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {currentUsername.slice(0, 1).toUpperCase()}
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold">{currentUsername}</p>
          )}
        </div>
      </aside>

      <div className={sidebarCollapsed ? 'min-h-screen md:pl-20' : 'min-h-screen md:pl-64'}>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Back Office</p>
              <h1 className="mt-1 text-2xl font-bold">{menuLabels[activeMenu]}</h1>
            </div>
            {isCategoriesMenu ? (
              <div className="flex items-center gap-2">
                <Button type="button" onClick={() => void loadCategories()} disabled={categoriesLoading}>
                  <RefreshCcw className="size-4" />
                  {categoriesLoading ? '새로고침 중...' : '목록 새로고침'}
                </Button>
                <Button type="button" variant="outline" onClick={() => void handleLogout()} disabled={logoutPending}>
                  {logoutPending ? '로그아웃 중...' : '로그아웃'}
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => void handleLogout()} disabled={logoutPending}>
                {logoutPending ? '로그아웃 중...' : '로그아웃'}
              </Button>
            )}
          </div>
        </header>

        <div className="space-y-6 px-5 py-6 md:px-8">
          {activeMenu === 'dashboard' ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">대시보드</h2>
              <p className="mt-2 text-sm text-slate-600">
                운영 요약 위젯 영역입니다. 현재는 카테고리 관리 기능이 중심이며, 추후 매출/주문 통계를 연결할 수 있습니다.
              </p>
            </section>
          ) : null}

          {activeMenu === 'categories' ? (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">카테고리 생성</h2>
                <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleCreateCategory}>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">이름</span>
                    <input
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                      value={createForm.name}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">슬러그</span>
                    <input
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                      value={createForm.slug}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          slug: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">상위 카테고리</span>
                    <select
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                      value={createForm.parentId}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          parentId: event.target.value,
                        }))
                      }
                    >
                      <option value="">없음 (depth 1)</option>
                      {parentCandidates.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                          [{category.depth}] {category.name} ({category.path})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500">정렬 순서</span>
                    <input
                      type="number"
                      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                      value={createForm.sortOrder}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          sortOrder: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={createForm.isActive}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                    활성화
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={createForm.isVisible}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          isVisible: event.target.checked,
                        }))
                      }
                    />
                    노출
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={createForm.isMainExposed}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          isMainExposed: event.target.checked,
                        }))
                      }
                    />
                    메인 노출
                  </label>
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={createPending}>
                      {createPending ? '생성 중...' : '카테고리 생성'}
                    </Button>
                    {createMessage ? <p className="mt-2 text-sm text-slate-600">{createMessage}</p> : null}
                  </div>
                </form>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold">카테고리 목록</h2>
                  {categoriesError ? <p className="text-sm font-medium text-rose-500">{categoriesError}</p> : null}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-2 py-3">ID/Depth</th>
                        <th className="px-2 py-3">Path</th>
                        <th className="px-2 py-3">Name</th>
                        <th className="px-2 py-3">Slug</th>
                        <th className="px-2 py-3">Sort</th>
                        <th className="px-2 py-3">Flags</th>
                        <th className="px-2 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => {
                        const draft = editDrafts[category.id];
                        if (!draft) {
                          return null;
                        }

                        return (
                          <tr key={category.id} className="border-b border-slate-100 align-top">
                            <td className="px-2 py-3 text-xs text-slate-600">
                              #{category.id}
                              <br />
                              depth {category.depth}
                            </td>
                            <td className="px-2 py-3 font-mono text-xs text-slate-600">{category.path}</td>
                            <td className="px-2 py-3">
                              <input
                                className="h-9 w-44 rounded-lg border border-slate-300 px-2 text-sm"
                                value={draft.name}
                                onChange={(event) => {
                                  setEditDrafts((prev) => ({
                                    ...prev,
                                    [category.id]: {
                                      ...prev[category.id],
                                      name: event.target.value,
                                    },
                                  }));
                                }}
                              />
                            </td>
                            <td className="px-2 py-3">
                              <input
                                className="h-9 w-44 rounded-lg border border-slate-300 px-2 text-sm"
                                value={draft.slug}
                                onChange={(event) => {
                                  setEditDrafts((prev) => ({
                                    ...prev,
                                    [category.id]: {
                                      ...prev[category.id],
                                      slug: event.target.value,
                                    },
                                  }));
                                }}
                              />
                            </td>
                            <td className="px-2 py-3">
                              <input
                                type="number"
                                className="h-9 w-20 rounded-lg border border-slate-300 px-2 text-sm"
                                value={draft.sortOrder}
                                onChange={(event) => {
                                  setEditDrafts((prev) => ({
                                    ...prev,
                                    [category.id]: {
                                      ...prev[category.id],
                                      sortOrder: event.target.value,
                                    },
                                  }));
                                }}
                              />
                            </td>
                            <td className="px-2 py-3">
                              <div className="space-y-1 text-xs">
                                <label className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={draft.isActive}
                                    onChange={(event) => {
                                      setEditDrafts((prev) => ({
                                        ...prev,
                                        [category.id]: {
                                          ...prev[category.id],
                                          isActive: event.target.checked,
                                        },
                                      }));
                                    }}
                                  />
                                  active
                                </label>
                                <label className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={draft.isVisible}
                                    onChange={(event) => {
                                      setEditDrafts((prev) => ({
                                        ...prev,
                                        [category.id]: {
                                          ...prev[category.id],
                                          isVisible: event.target.checked,
                                        },
                                      }));
                                    }}
                                  />
                                  visible
                                </label>
                                <label className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={draft.isMainExposed}
                                    onChange={(event) => {
                                      setEditDrafts((prev) => ({
                                        ...prev,
                                        [category.id]: {
                                          ...prev[category.id],
                                          isMainExposed: event.target.checked,
                                        },
                                      }));
                                    }}
                                  />
                                  main
                                </label>
                              </div>
                            </td>
                            <td className="px-2 py-3">
                              <div className="flex flex-col gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => void handleUpdateCategory(category.id)}
                                  disabled={updatePendingId === category.id}
                                >
                                  저장
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    void handleMainExposureToggle(category.id, !category.isMainExposed)
                                  }
                                  disabled={updatePendingId === category.id}
                                >
                                  메인노출 토글
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {updateMessage ? <p className="mt-3 text-sm text-slate-600">{updateMessage}</p> : null}
              </section>
            </>
          ) : null}

          {activeMenu === 'products' ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">상품 관리</h2>
              <p className="mt-2 text-sm text-slate-600">상품 관리 화면은 다음 단계에서 연결합니다.</p>
            </section>
          ) : null}

          {activeMenu === 'settings' ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">설정</h2>
              <p className="mt-2 text-sm text-slate-600">시스템 설정 화면은 다음 단계에서 연결합니다.</p>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
