if not active_user == "root" then exit("<color=red>*** must run [purple] as root ***")

_ENV_ = {}
_ENV_.root_dir = "/root/purple"

if not get_shell.host_computer.File(_ENV_.root_dir) then get_shell.host_computer.create_folder("/root", "purple")

import_code("/root/purple/callback");
import_code("/root/purple/markup");
import_code("/root/purple/prototypes");
import_code("/root/purple/syntax");

