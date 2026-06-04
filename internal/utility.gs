Directory = {}

Directory.find_file_memory = [];
Directory.find_file = function(file_obj, file_path = 0, file_name = 0, return_all = 0, is_first_pass = 1)
    if is_first_pass then 
        if file_path == "" then file_path = "/"
        find_file_memory = []
        is_first_pass = 0 
    end if 

    if typeof(file_path) == "string" and file_path == "/" then return file_obj
    if typeof(file_path) == "string" and file_path[0] != "/" then file_path = "/" + file_path
    if typeof(file_path) == "string" and file_path[-1] == "/" then file_path = path[:-1]
    if typeof(file_path) == "string" then file_path = file_path.lower
    if typeof(file_name) == "string" then file_name = file_name.lower

    target_file = false

    for object in file_obj.get_folders + file_obj.get_files
        if typeof(object) != "file" then continue
        if not return_all and typeof(target_file) == "file" then 
            self.find_file_memory = []
            return target_file
        end if 
        
        if return_all and [file_path, file_name] == [0, 0] then 
            self.find_file_memory.push([object, object.name, object.get_content, {"is_folder": object.is_folder, "is_binary": object.is_binary}, object.size, object.permissions, object.owner, object.group])
            continue 
        end if 

        if (return_all and typeof(file_name) == "string") and object.name.lower.search(file_name.lower) then 
            self.find_file_memory.push([object, object.name, object.get_content, {"is_folder": object.is_folder, "is_binary": object.is_binary}, object.size, object.permissions, object.owner, object.group])
            continue
        end if 

        if (typeof(file_path) == "string" and not return_all) and object.path.lower == file_path.lower then 
            target_file = object 
            continue
        end if 
        
        if (typeof(file_name) == "string" and not return_all) and object.name.lower.search(file_name.lower) then 
            target_file = object 
            continue
        end if 

        if ([file_path, file_name, return_all] == [0, 0, 0]) then 
            self.find_file_memory.push([object, object.name, object.path, object.get_content, {"is_folder": object.is_folder, "is_binary": object.is_binary}, object.size, object.permissions, object.owner, object.group])
        end if 

        if object.is_folder then target_file = self.find_file(object, file_path, file_name, return_all, is_first_pass)
    end for 

    if ([file_path, file_name, return_all] == [0, 0, 0]) or return_all then return self.find_file_memory
    self.find_file_memory = [] 
   
    return target_file
end function

Directory.validate_file = function(root_file, cmd_name, param_token, only_folders = 0, all = 0)
    param_token_value = param_token[0].value
    param_token_type = param_token[0].type
    target_file = false
    
    is_keyword = true 
    if param_token_value.split("/").len > 1 then is_keyword = false
  
    if not typeof(root_file) == "file" then return _callback.catch("[blbx][" + cmd_name + "][err]: remote session has no file objects...")
    
    if is_keyword then 
        if all then 
            target_file_arr = Directory.find_file(root_file, 0, param_token_value, 1)
            if not target_file_arr.len then return _callback.catch("[blbx][" + cmd_name + "][err]: could not find any matches for keyword '" + param_token_value + "'...")
            return _callback.catch(target_file_arr, 1)
        end if 
        target_file = Directory.find_file(root_file, 0, param_token_value)
        if not typeof(target_file) == "file" then return _callback.catch("[blbx][" + cmd_name + "][err]: could not find target file by name...")
        if not target_file.is_folder and only_folders then return _callback.catch("[blbx][" + cmd_name + "][err]: object must be a folder...")

        return _callback.catch(target_file, 1)
    end if

    target_file = Directory.find_file(root_file, param_token_value)
    if not typeof(target_file) == "file" then return _callback.catch("[blbx][" + cmd_name + "][err]: could not find target file by name...")
    if not target_file.is_folder and only_folders then return _callback.catch("[blbx]["+cmd_name+"][err]: object must be a folder...")

    return _callback.catch(target_file, 1)
end function 

Machine = {}
Machine.is_remote = false 
Machine.user_land = {}
Machine.objects = {}
Machine.objects.shell = []
Machine.objects.comp = []
Machine.objects.file = []

Machine.add_file = function(object)
    while object.parent != "/"; object = object.parent; end while
    if typeof(object) == "file" then self.objects.fiie.push(object)
end function

Machine.add_comp = function(object)
    if typeof(object) == "computer" then self.objects.comp.push(object)
    self.add_file(object.File("/"))
end function 

Machine.add_shell = function(object)
    if typeof(object) == "shell" then self.objects.shell.push(object)
    self.add_comp(object.host_computer)
end function 

Machine.user_land.get_user = function(object)
    if typeof(object) == "shell" then object = object.host_computer.File("/")

    if not typeof(Directory.find_file(object, "/root")) == "file" then file = [Directory.find_file(object, "/"), Directory.find_file(object, "/home")] else file = [Directory.find_file(object, "/root"), Directory.find_file(object, "/home")]
 
    if typeof(file[0]) == "file" and file[0].has_permission("w") then return "root"
    if typeof(file[1]) == "file" then user_list = file[1].get_folders
    users = [] 
    result = []

    for file in user_list 
        if file.name != file.owner then continue // ignore non user directories (arbitrary folders placed in home directory)
        if file.has_permission("w") then users.push(file.owner)
    end for 

    if users.hasIndex(1) then return users[0]
    if typeof(users.indexOf("guest")) == "number" then return "guest"
    return "unknown"
end function

Machine.get_shell = function(user = "unknown", lan_address = false)
    // shell : [object, lan_address]
    result_shell = false
    for shell in self.objects.shell
        if self.user_land.get_user(shell) == user and (lan_address and shell[1] == lan_address) then 
            result_shell.push(shell)
            break 
        end if 
    end for
end function 

Machine.get_comp = function(user = "unknown", lan_address = false)
    // comp : [object, lan_address]
    result_comp = false
    for comp in self.objects.comp
        if self.user_land.get_user(comp) == user and (lan_address and comp[1] == lan_address) then 
            result_comp.push(comp)
            break 
        end if 
    end for
end function 

Machine.get_root = function(user = "unknown", lan_address = false)
    // file : [object, lan_address]
    result_file = false
    for file in self.objects.file
        if self.user_land.get_user(file) == user and (lan_address and file[1] == lan_address) then 
            result_file.push(file)
            break 
        end if 
    end for
end function 

Machine.reset_remote = function()
    self.objects.shell = []
    self.objects.comp = []
    self.objects.file = []
    self.is_remote = false 
end function 

Exploit = {}
Exploit.module = {}
Exploit.module.components = {}
Exploit.module.actions = {}
Exploit.module.components.net_session = false 
Exploit.module.components.metaxploit = false


Exploit.module.components.get_net_session = function()
    return self.net_session
end function

Exploit.module.components.set_net_session = function(net_session)
    self.net_session = net_session
end function

Exploit.module.components.get_metaxploit = function()
    return self.metaxploit
end function

Exploit.module.components.set_metaxploit = function(metaxploit)
    self.metaxploit = metaxploit
end function 

Exploit.module.get_payloads = function(memory_address)

end function

Exploit.module.actions.attack = function(lan_address, change_password = false, third_arg)

end function

