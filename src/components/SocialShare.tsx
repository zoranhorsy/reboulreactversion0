import { Button } from "@/components/ui/button";
import { 
  IconBrandFacebook, 
  IconBrandTwitter, 
  IconBrandLinkedin 
} from "@tabler/icons-react";

type SocialShareProps = {
  url: string;
  title: string;
};

export function SocialShare({ url, title }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Facebook",
      icon: IconBrandFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: IconBrandTwitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: IconBrandLinkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
    },
  ];

  return (
    <div className="flex space-x-2">
      {shareLinks.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          size="icon"
          onClick={() => window.open(link.url, "_blank")}
          aria-label={`Partager sur ${link.name}`}
        >
          <link.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
