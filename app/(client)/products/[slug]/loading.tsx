export default function ProductDetailLoading() {
    return (
        <div className="bg-vinfast-gray min-h-screen pb-20 animate-pulse">
            {/* Hero Skeleton Layout */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 md:px-8 py-12 lg:py-20 lg:pt-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* LEFT Image Skeleton */}
                        <div className="relative bg-gray-100 rounded-3xl p-8 md:p-12 aspect-[4/3] w-full border border-gray-50"></div>

                        {/* RIGHT Text Skeleton */}
                        <div className="flex flex-col space-y-6 w-full">
                            <div className="h-12 bg-gray-200 rounded-xl w-3/4"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>

                            <div className="space-y-3 pt-6">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>

                            {/* Specs Skeleton */}
                            <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-6 mt-4">
                                <div className="h-24 bg-gray-100 rounded-2xl w-full"></div>
                                <div className="h-24 bg-gray-100 rounded-2xl w-full"></div>
                                <div className="h-24 bg-gray-100 rounded-2xl w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description Area Skeleton */}
            <div className="container mx-auto px-4 md:px-8 mt-12 lg:mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4 bg-white p-8 md:p-12 rounded-3xl border border-gray-100">
                        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                    </div>
                    {/* Form Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="h-[460px] bg-white rounded-3xl border border-gray-100 w-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
