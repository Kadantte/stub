import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { mutate } from 'swr';
import { useDebounce } from 'use-debounce';

import BlurImage from '@/components/shared/blur-image';
import { AlertCircleFill } from '@/components/shared/icons';
import LoadingDots from '@/components/shared/icons/loading-dots';
import Modal from '@/components/shared/modal';
import useProject from '@/lib/swr/use-project';

function EditDomainModal({
  showEditDomainModal,
  setShowEditDomainModal
}: {
  showEditDomainModal: boolean;
  setShowEditDomainModal: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { slug } = router.query;
  const [saving, setSaving] = useState(false);
  const [domainError, setDomainError] = useState(null);
  const { project: { domain } = {} } = useProject();

  const [data, setData] = useState(domain);

  const [debouncedDomain] = useDebounce(data, 500);
  useEffect(() => {
    if (debouncedDomain.length > 0 && debouncedDomain !== domain) {
      fetch(`/api/domains/${debouncedDomain}/exists`).then(async (res) => {
        if (res.status === 200) {
          const exists = await res.json();
          setDomainError(exists === 1 ? 'Domain is already in use.' : null);
        }
      });
    }
  }, [debouncedDomain]);

  return (
    <Modal showModal={showEditDomainModal} setShowModal={setShowEditDomainModal}>
      <div className="inline-block w-full max-w-md overflow-hidden align-middle transition-all transform bg-white shadow-xl rounded-2xl">
        <div className="flex flex-col justify-center items-center space-y-3 sm:px-16 px-4 pt-8 py-4 border-b border-gray-200">
          <BlurImage
            src={`https://logo.clearbit.com/${domain}`}
            alt={domain}
            className="w-10 h-10 rounded-full border border-gray-200"
            width={20}
            height={20}
          />
          <h3 className="font-medium text-lg">Change Domain</h3>
          <p className="text-sm text-gray-500">Warning: Changing your project's domain will break all existing short links.</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            fetch(`/api/projects/${slug}/domain`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            }).then(async (res) => {
              setSaving(false);
              if (res.status === 200) {
                mutate(`/api/projects/${slug}`);
                setShowEditDomainModal(false);
              } else if (res.status === 422) {
                const { domainError: domainErrorResponse } = await res.json();
                if (domainErrorResponse) {
                  setDomainError(domainErrorResponse);
                }
              } else if (res.status === 400) {
                setDomainError('Domain is already in use.');
              }
            });
          }}
          className="flex flex-col space-y-6 text-left bg-gray-50 sm:px-16 px-4 py-8"
        >
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700">
              Domain
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="key"
                id="key"
                required
                autoFocus={false}
                pattern="[a-zA-Z0-9\-.]+"
                className={`${
                  domainError
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500'
                } pr-10 block w-full rounded-md focus:outline-none sm:text-sm`}
                placeholder={domain}
                value={data}
                onChange={(e) => {
                  setDomainError(null);
                  setData(e.target.value);
                }}
                aria-invalid="true"
                aria-describedby="key-error"
              />
              {domainError && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircleFill className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
              )}
            </div>
            {domainError && (
              <p className="mt-2 text-sm text-red-600" id="domain-error">
                {domainError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="verification" className="block text-sm text-gray-700">
              To verify, type <span className="font-semibold">confirm domain change</span> below
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="verification"
                id="verification"
                pattern="confirm domain change"
                required
                autoFocus={false}
                className="border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-500 focus:ring-gray-500 pr-10 block w-full rounded-md focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          <button
            disabled={saving || domainError}
            className={`${
              saving || domainError
                ? 'cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400'
                : 'bg-red-600 hover:bg-white hover:text-red-600 border-red-600 text-white'
            } flex justify-center items-center w-full text-sm h-10 rounded-md border transition-all focus:outline-none`}
          >
            {saving ? <LoadingDots color="#808080" /> : <p>Confirm domain change</p>}
          </button>
        </form>
      </div>
    </Modal>
  );
}

export function useEditDomainModal() {
  const [showEditDomainModal, setShowEditDomainModal] = useState(false);

  const EditDomainModalCallback = useCallback(() => {
    return <EditDomainModal showEditDomainModal={showEditDomainModal} setShowEditDomainModal={setShowEditDomainModal} />;
  }, [showEditDomainModal, setShowEditDomainModal]);

  return useMemo(
    () => ({
      setShowEditDomainModal,
      EditDomainModal: EditDomainModalCallback
    }),
    [setShowEditDomainModal, EditDomainModalCallback]
  );
}
