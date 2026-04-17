export type UserData = {
  mediaPath: string;
  port: number;
  mediaData: Media[];
}

type Media = {
  name: string;
  thumbnail: string;
  media: string;
}

