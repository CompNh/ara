export type ArtistIdentifier = string | number;

export interface AlbumRecord {
  albumId: string | number;
  albumTitle: string;
  artistId: string | number;
  artistName: string;
}

const isNumericString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));

const normalizeId = (artist: ArtistIdentifier): string | null => {
  if (typeof artist === "number") return String(artist);
  return isNumericString(artist) ? artist.trim() : null;
};

/**
 * 앨범 목록에서 특정 아티스트의 레코드만 필터링한다.
 *
 * 기존에는 아티스트 이름 문자열만 허용했지만, 이제 숫자/문자열 형태의 ID도
 * 함께 받아 동일하게 처리한다. 숫자형 문자열(예: "42")도 ID로 취급하되,
 * 이름이 숫자로만 구성된 아티스트도 기존처럼 매칭한다.
 */
export const artist_by_album = (
  albums: AlbumRecord[],
  artist: ArtistIdentifier,
): AlbumRecord[] => {
  const normalizedId = normalizeId(artist);
  const normalizedName = String(artist).trim();

  return albums.filter(({ artistId, artistName }) => {
    const matchesId = normalizedId !== null && String(artistId) === normalizedId;
    const matchesName = artistName === normalizedName;

    return matchesId || matchesName;
  });
};
