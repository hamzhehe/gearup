Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinCred {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);

    [DllImport("advapi32.dll", SetLastError = true)]
    public static extern bool CredFree(IntPtr cred);
}
"@

function Get-WinCredential {
    param([string]$Target)

    [IntPtr]$credPtr = [IntPtr]::Zero
    if (-not [WinCred]::CredRead($Target, 1, 0, [ref]$credPtr)) {
        return $null
    }

    try {
        $cred = [Runtime.InteropServices.Marshal]::PtrToStructure($credPtr, [Type][WinCred+CREDENTIAL])
        $password = [Runtime.InteropServices.Marshal]::PtrToStringUni(
            $cred.CredentialBlob,
            $cred.CredentialBlobSize / 2
        )
        return @{
            UserName = $cred.UserName
            Password = $password
        }
    }
    finally {
        [WinCred]::CredFree($credPtr) | Out-Null
    }
}

$targets = @(
    'git:https://github.com',
    'LegacyGeneric:target=git:https://github.com',
    'GitHub - https://api.github.com/hamzhehe',
    'LegacyGeneric:target=GitHub - https://api.github.com/hamzhehe'
)

foreach ($target in $targets) {
    $cred = Get-WinCredential -Target $target
    if ($null -ne $cred -and $cred.Password) {
        $env:GH_USER = $cred.UserName
        $env:GH_TOKEN = $cred.Password
        return
    }
}

throw 'No GitHub credentials found in Windows Credential Manager.'
