from pathlib import Path
import yt_dlp

def download(url: str, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)

    ydl_opts = {
        # mp4 우선 + 가능한 최고 화질(FFmpeg 있으면 자동 병합)
        "format": "bv*+ba/best",
        "outtmpl": str(out_dir / "%(title)s.%(ext)s"),
        "noplaylist": True,         # 플레이리스트 말고 단일 영상만
        "retries": 3,
        "quiet": False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

def main():
    print("YouTube Downloader (for content you have rights to download)")
    url = input("유튜브 URL: ").strip()
    if not url:
        print("URL이 비었습니다.")
        return

    folder = input("저장 폴더(엔터=downloads): ").strip() or "downloads"
    out_dir = Path(folder)

    try:
        download(url, out_dir)
        print(f"\n✅ 완료! 저장 위치: {out_dir.resolve()}")
    except Exception as e:
        print("\n❌ 에러 발생:", e)

if __name__ == "__main__":
    main()