import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Fragment } from 'react';

import SuperAdmin from '@/components/shared/icons/superadmin';
import Tooltip from '@/components/shared/tooltip';

export default function UserDropdown() {
  const { data: session } = useSession();
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="flex gap-4 items-center">
        {session?.user?.superadmin && (
          <Tooltip content="You are a superadmin, pretty cool!">
            <div>
              <SuperAdmin className="w-6 h-6 text-gray-500" />
            </div>
          </Tooltip>
        )}
        <Menu.Button className="rounded-full overflow-hidden border border-gray-300 w-10 h-10 flex justify-center items-center active:scale-95 focus:outline-none transition-all duration-75">
          {session && (
            <img
              alt={session?.user?.email || 'Avatar for logged in user'}
              src={session?.user?.image || `https://avatars.dicebear.com/api/micah/${session?.user?.email}.svg`}
            />
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 p-1 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {session?.user?.superadmin && (
            <Link href="/admin">
              <Menu.Item>
                <a className="text-gray-900 hover:bg-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm">Admin</a>
              </Menu.Item>
            </Link>
          )}
          <Menu.Item>
            <button className="text-gray-900 hover:bg-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm" onClick={() => signOut()}>
              Logout
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
