"""Pluggable media storage. Local filesystem for dev, S3/MinIO for prod."""
import os
import shutil
from .config import settings


class LocalStorage:
    def __init__(self, base: str):
        self.base = base
        os.makedirs(base, exist_ok=True)

    def save(self, key: str, data: bytes) -> str:
        path = os.path.join(self.base, key)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            f.write(data)
        return key

    def local_path(self, key: str) -> str:
        """Absolute path the worker can read for transcription."""
        return os.path.join(self.base, key)

    def open(self, key: str):
        return open(self.local_path(key), "rb")


class S3Storage:
    def __init__(self):
        import boto3
        self.bucket = settings.s3_bucket
        kwargs = dict(region_name=settings.s3_region,
                      aws_access_key_id=settings.s3_access_key,
                      aws_secret_access_key=settings.s3_secret_key)
        if settings.s3_endpoint_url:
            kwargs["endpoint_url"] = settings.s3_endpoint_url
        self.client = boto3.client("s3", **kwargs)

    def save(self, key: str, data: bytes) -> str:
        self.client.put_object(Bucket=self.bucket, Key=key, Body=data)
        return key

    def local_path(self, key: str) -> str:
        # download to a temp file so providers/ffmpeg can read it
        import tempfile
        fd, path = tempfile.mkstemp(suffix="_" + os.path.basename(key))
        os.close(fd)
        self.client.download_file(self.bucket, key, path)
        return path

    def open(self, key: str):
        return open(self.local_path(key), "rb")


def get_storage():
    if settings.storage_backend == "s3":
        return S3Storage()
    return LocalStorage(settings.media_dir)


storage = get_storage()
