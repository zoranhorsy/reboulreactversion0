import Image from "next/image";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin">
        <Image
          src="/images/logo_black.png"
          alt="Reboul Logo"
          width={64}
          height={64}
        />
      </div>
    </div>
  );
}
