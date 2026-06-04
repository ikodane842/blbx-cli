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