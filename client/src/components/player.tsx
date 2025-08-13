
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { MediaPlayer, type MediaPlayerProps, MediaProvider, Poster, Track } from "@vidstack/react"
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';

export const textTracks = [
  // Subtitles
  {
    src: 'https://files.vidstack.io/sprite-fight/subs/english.vtt',
    label: 'English',
    language: 'en-US',
    kind: 'subtitles',
    default: true,
  },
  {
    src: 'https://files.vidstack.io/sprite-fight/subs/spanish.vtt',
    label: 'Spanish',
    language: 'es-ES',
    kind: 'subtitles',
  },
  // Chapters
  {
    src: 'https://files.vidstack.io/sprite-fight/chapters.vtt',
    kind: 'chapters',
    language: 'en-US',
    default: true,
  },
] as const;


export default function Player(  props: MediaPlayerProps, thumbnails?: string) {
  return (
    <MediaPlayer
      {...props}
    >
      <MediaProvider>
        <Poster className="vds-poster" />
        {textTracks.map(track => (
          <Track {...track} key={track.src} />
        ))}
      </MediaProvider>
      <DefaultVideoLayout
        thumbnails={thumbnails ?? 'https://files.vidstack.io/sprite-fight/thumbnails.vtt'}
        icons={defaultLayoutIcons}
      />
    </MediaPlayer>
  )
}