import AppLayout from 'components/layout/app';
import Router from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import useSWR from 'swr';

import { useAddProjectModal } from '@/components/app/add-project-modal';
import NoProjectsPlaceholder from '@/components/app/no-projects-placeholder';
import ProjectCard from '@/components/app/project-card';
import ProjectCardPlaceholder from '@/components/app/project-card-placeholder';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import { ProjectProps } from '@/lib/types';
import { fetcher } from '@/lib/utils';

export default function App() {
  const { data, error } = useSWR<ProjectProps[]>(`/api/projects`, fetcher);
  const { setShowAddProjectModal, AddProjectModal } = useAddProjectModal({});
  const { data: session } = useSession();

  useEffect(() => {
    if (error && error.message === 'Unauthorized') Router.replace('/login');
  }, [error]);

  return (
    <AppLayout pageTitle="My Projects">
      {data && <AddProjectModal />}
      <div className="h-20 md:h-36 flex items-center bg-white border-b border-gray-200">
        <MaxWidthWrapper>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl text-gray-600">My Projects</h1>
            {session && (session.user?.superadmin || session.user?.type === 'admin') && (
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="text-white hover:text-black bg-black hover:bg-white active:scale-95 font-medium text-sm px-5 py-2 border rounded-md border-black transition-all duration-75"
              >
                Add
              </button>
            )}
          </div>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper>
        <div className={`my-10 grid grid-cols-1 ${data?.length === 0 ? '' : 'lg:grid-cols-3'} gap-5`}>
          {data ? (
            data.length > 0 ? (
              data.map((d) => <ProjectCard key={d.slug} {...d} />)
            ) : (
              <NoProjectsPlaceholder setShowAddProjectModal={setShowAddProjectModal} />
            )
          ) : (
            Array.from({ length: 6 }).map((_, i) => <ProjectCardPlaceholder key={i} />)
          )}
        </div>
      </MaxWidthWrapper>
    </AppLayout>
  );
}
