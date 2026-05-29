import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';

// 写真ライブラリから1枚選択（権限要求込み）。キャンセル時は null。
export async function pickImage(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: false,
    quality: 0.7,
  });
  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}

function imagesDir(): Directory {
  const dir = new Directory(Paths.document, 'images');
  if (!dir.exists) dir.create({ idempotent: true });
  return dir;
}

// 一時uriを永続領域へコピーし、保存先の絶対uriを返す
export async function persistImage(srcUri: string): Promise<string> {
  const dir = imagesDir();
  const src = new File(srcUri);
  const ext = src.extension || '.jpg';
  const dest = new File(dir, `${Crypto.randomUUID()}${ext}`);
  await src.copy(dest);
  return dest.uri;
}

// 保存済み画像を削除（存在しなければ何もしない）
export function deleteImageFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // ファイルが既に無い等は無視
  }
}
