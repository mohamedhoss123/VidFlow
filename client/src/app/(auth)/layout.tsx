import Image from 'next/image'
import GoogleLogo from '~/assets/google.svg'
import { Button } from '~/components/ui/button'

export function AuthProviderButtons() {
  return (
    <div className="flex flex-col gap-4 ">
      <Button type="button" variant="outline" className="w-full">
        <Image src={GoogleLogo} alt="Google Logo" width={20} height={20} />
        with Google
      </Button>
    </div>
  )
}

export default function Auth({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary-foreground">
      <div className="container mx-auto grid h-[calc(100dvh-60px)] px-15">
        <div className="flex flex-col items-center justify-center gap-10 text-center font-sans">
          <div className="flex flex-col gap-6">
            {children}
            <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
              By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
