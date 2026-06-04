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

import_code("/root/purple/prompt");
import_code("/root/purple/utility");

_PROGRAM_.env = {}
_PROGRAM_.env.shell = function()
    if Machine.is_remote then 
        shell = Machine.get_shell(Prompt.get_username)
        if not shell then return false
    end if
    return get_shell
end function 

_PROGRAM_.env.comp = function()
    if Machine.is_remote then 
        comp = Machine.get_comp(Prompt.get_username)
        if not comp then return false
    end if
    return get_shell.host_computer
end function

_PROGRAM_.env.root = function()
    if Machine.is_remote then 
        root = Machine.get_file(Prompt.get_username)
        if not root then return false
    end if
    return get_shell.host_computer.File("/")
end function

_first_iteration_ = true
if not get_shell.host_computer.File(_ENV_.root_dir) then get_shell.host_computer.create_folder("/root", "purple")

// dependencies
import_code("/root/purple/callback");
import_code("/root/purple/prototypes");
import_code("/root/purple/markup");
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

