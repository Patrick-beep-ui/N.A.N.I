# Control de Spotify desde terminal (N.A.N.I.)

> Referencia operativa histórica: verificar rutas y proceso antes de ejecutar. Enviar una tecla no demuestra por sí solo que Spotify reprodujo o cambió de pista. Aplicar `nani-execution`.

## Teclas multimedia (keybd_event)

- Play/Pause: 0xB3 (VK_MEDIA_PLAY_PAUSE)
- Siguiente pista: 0xB0 (VK_MEDIA_NEXT_TRACK)
- Pista anterior: 0xB1 (VK_MEDIA_PREV_TRACK)
- Stop: 0xB2 (VK_MEDIA_STOP)

## PowerShell para enviar teclas

```powershell
Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);' -Name KB -Namespace Win32;
[Win32.KB]::keybd_event(0xB3, 0, 0, [UIntPtr]::Zero); Start-Sleep -Milliseconds 50;
[Win32.KB]::keybd_event(0xB3, 0, 0x0002, [UIntPtr]::Zero);
```

## Abrir Spotify

```powershell
Start-Process -FilePath "spotify:" -ErrorAction SilentlyContinue
Start-Process "C:\Users\patri\AppData\Roaming\Spotify\Spotify.exe" -ErrorAction SilentlyContinue
```

## Spotify_Guard (Final_Project)

- Directorio: C:\Users\patri\Documents\Parallel_Programs\Spotify_Guard\Final_Project\
- Ejecutar: python sp_guard.py
- Listas: artists/excluded.txt (modo excluded), artists/exclusive.txt (modo exclusive)

## Comandos interactivos (stdin)

- mode excluded / mode exclusive
- add <artista>
- remove <artista>
- show
- help

## Lógica

- Modo excluded: salta artistas en excluded.txt
- Modo exclusive: solo reproduce artistas en exclusive.txt, salta el resto
- Usa psutil + win32gui para detectar Spotify y ventana
- Usa ctypes keybd_event para enviar siguiente pista
