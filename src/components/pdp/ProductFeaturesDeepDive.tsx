import React from 'react';
import { ProductThoughtfulFeature, ProductSpecificationItem } from '@/types/product';

export interface ProductFeaturesDeepDiveProps {
  narrativeTitle?: string;
  narrativeParagraphs?: string[];
  thoughtfulFeatures?: ProductThoughtfulFeature[];
  specifications?: ProductSpecificationItem[];
  inTheBag?: string;
}

export function ProductFeaturesDeepDive({
  narrativeTitle = 'Meet your next basecamp.',
  narrativeParagraphs = [],
  thoughtfulFeatures = [],
  specifications = [],
  inTheBag,
}: ProductFeaturesDeepDiveProps) {
  // Helper to render the verified semantic SVGs from the Stitch reference
  const renderFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'cloud-rain':
        return (
          <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M3.334 12.416C2.715 11.784 2.248 11.018 1.969 10.179C1.689 9.339 1.604 8.446 1.721 7.569C1.837 6.691 2.151 5.852 2.64 5.114C3.129 4.376 3.779 3.759 4.542 3.31C5.305 2.86 6.159 2.59 7.042 2.52C7.924 2.45 8.811 2.582 9.635 2.905C10.459 3.229 11.198 3.736 11.797 4.387C12.396 5.039 12.839 5.818 13.092 6.667H14.584C15.388 6.667 16.172 6.925 16.818 7.405C17.464 7.884 17.939 8.558 18.173 9.328C18.406 10.098 18.386 10.923 18.115 11.681C17.844 12.438 17.336 13.089 16.667 13.536M13.334 11.667V16.667M6.667 11.667V16.667M10 13.334V18.334"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.4"
            />
          </svg>
        );
      case 'wind':
        return (
          <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10.667 16.333C10.878 16.491 11.124 16.597 11.384 16.642C11.645 16.687 11.912 16.669 12.164 16.59C12.416 16.511 12.646 16.374 12.834 16.189C13.023 16.004 13.165 15.777 13.248 15.527C13.332 15.276 13.354 15.009 13.315 14.748C13.275 14.487 13.173 14.239 13.019 14.025C12.865 13.811 12.661 13.636 12.426 13.516C12.191 13.396 11.931 13.333 11.667 13.333H1.666M14.584 6.667C14.797 6.383 15.079 6.158 15.403 6.014C15.728 5.869 16.084 5.81 16.438 5.842C16.791 5.874 17.131 5.996 17.424 6.196C17.718 6.396 17.955 6.668 18.114 6.985C18.273 7.303 18.348 7.656 18.332 8.01C18.316 8.365 18.21 8.71 18.023 9.012C17.836 9.314 17.575 9.563 17.265 9.736C16.955 9.909 16.606 10 16.251 10H1.666"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.4"
            />
          </svg>
        );
      case 'tent':
        return (
          <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M2.916 17.5L10 5.357M2.916 17.5H1.666M2.916 17.5H7.083M10 5.357L11.667 2.5M10 5.357L17.084 17.5M10 5.357L8.333 2.5M17.084 17.5H12.917M17.084 17.5H18.334M12.917 17.5L10 12.5L7.083 17.5M12.917 17.5H7.083"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.4"
            />
          </svg>
        );
      case 'backpack':
      default:
        return (
          <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M6.667 8.333H13.333M6.667 15H13.333M6.667 15V18.334M6.667 15V13.334C6.667 12.892 6.843 12.468 7.155 12.155C7.468 11.842 7.892 11.667 8.333 11.667H11.667C12.109 11.667 12.532 11.842 12.845 12.155C13.157 12.468 13.333 12.892 13.333 13.334V15M13.333 15V18.334M6.667 18.334H13.333M6.667 18.334H5C4.559 18.334 4.135 18.158 3.822 17.846C3.51 17.533 3.334 17.109 3.334 16.667V8.333C3.334 7.449 3.685 6.601 4.31 5.976C4.935 5.351 5.783 5 6.667 5H7.5M13.333 18.334H15C15.442 18.334 15.865 18.158 16.178 17.846C16.49 17.533 16.666 17.109 16.666 16.667V8.333C16.666 7.449 16.315 6.601 15.69 5.976C15.065 5.351 14.217 5 13.333 5H12.5M7.5 5V3.333C7.5 2.891 7.676 2.467 7.988 2.154C8.301 1.842 8.725 1.666 9.167 1.666H10.833C11.275 1.666 11.699 1.842 12.012 2.154C12.324 2.467 12.5 2.891 12.5 3.333V5M7.5 5H12.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.4"
            />
          </svg>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start" data-purpose="features-deep-dive">
      {/* Left Column: Brand Story + Thoughtful by Design */}
      <div className="lg:col-span-6 flex flex-col gap-8">
        {/* Story Section */}
        <div id="description" className="scroll-mt-36">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {narrativeTitle}
          </h3>
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {narrativeParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        {/* Thoughtful Features List */}
        {thoughtfulFeatures.length > 0 && (
          <div id="features" className="scroll-mt-36">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-4 tracking-tight">
              Thoughtful by design
            </h4>
            <div className="flex flex-col gap-3.5">
              {thoughtfulFeatures.map((feat) => (
                <div
                  key={feat.title}
                  className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-slate-900 flex items-center justify-center flex-shrink-0">
                    {renderFeatureIcon(feat.icon)}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      {feat.title}
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Technical Specifications Table & In the Bag */}
      <div id="specifications" className="lg:col-span-6 flex flex-col gap-6 scroll-mt-36">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Technical specifications
        </h3>

        {/* Specifications Table */}
        {specifications.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs shadow-2xs">
            <table className="w-full text-left border-collapse">
              <tbody>
                {specifications.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  const isLast = idx === specifications.length - 1;
                  return (
                    <tr
                      key={item.label}
                      className={`${isEven ? 'bg-slate-50/70' : 'bg-white'} ${
                        !isLast ? 'border-b border-slate-200' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-600 font-medium w-1/3">
                        {item.label}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-semibold">
                        {item.value}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* In the Bag Callout Box */}
        {inTheBag && (
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white shadow-2xs">
            <h5 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
              In the bag
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {inTheBag}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
