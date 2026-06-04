if not active_user == "root" then exit("<color=red>*** must run [purple] as root ***")

_ENV_ = {}
_ENV_.root_dir = "/root/purple"

_COMMAND_ = {}

_PROGRAM_ = {}
_PROGRAM_.is_running = true
_PROGRAM_.kill = function(); self.is_running = false; end function

_PROGRAM_.process = {}
_PROGRAM_.process.safe_run = function(cmd_name, parameters, data = 0)
    if typeof(_COMMAND_.indexes.indexOf(cmd_name)) != "number" then return false
    command_proxy = _COMMAND_[cmd_name]
    return command_proxy(parameters)
end function

_PROGRAM_.env = {}
_PROGRAM_.env.shell = get_shell 
_PROGRAM_.env.comp = get_shell.host_computer 
_PROGRAM_.env.root = get_shell.host_computer.File("/")

_first_iteration_ = true
if not get_shell.host_computer.File(_ENV_.root_dir) then get_shell.host_computer.create_folder("/root", "purple")

// dependencies
import_code("/root/purple/callback");
import_code("/root/purple/prototypes");
import_code("/root/purple/prompt");
import_code("/root/purple/markup");
import_code("/root/purple/utility");
import_code("/root/purple/linux");
import_code("/root/purple/syntax");

// main runtime-loop
while _PROGRAM_.is_running 
    if params.len and _first_iteration_ then input = Params.translate_input_brackets(params.join(" ")) else input = user_input(Prompt.get_message())
    if _first_iteration_ then _first_iteration_ = false 
    
    Interpreter.set_input(input.split(":").clean(""))
    command_result = Interpreter.Execute()
    Interpreter.wipe(1, 1)
end while 

