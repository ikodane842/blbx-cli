_COMMAND_.ls = function(PARAMS)
    cmd_requirements = function()
        //none
    end function
    
    current_directory = _PROGRAM_.env.comp.File(Prompt.get_current_path())
    folders = current_directory.get_folders
    files = current_directory.get_files
    to_format = [("permissions".c + " " + "group".c + " " + "owner".c + " " + "size".c + " " + "name".c)]

    for file in (folders + files)
        if file.is_folder then
            row = file.permissions.c_all_purple + " " + file.group.c_all_purple + " " + file.owner.c_all_purple + " " + file.size.c_all_purple + " " + file.name.c_all_purple        
        else 
            row = file.permissions.c_all_purple + " " + file.group.c_all_purple + " " + file.owner.c_all_purple + " " + file.size.c_all_purple + " " + file.name.c_all_black
        end if
        to_format.push(row)
    end for

    print to_format.fmt_cols

    return _callback.catch("", 1)
end function 

_COMMAND_.cd = function(PARAMS)
    cmd_requirements = function() 
        if not PARAMS.len then 
            print // design line
            return false
        end if 
        return true
    end function
    if not cmd_requirements then return _callback.catch("", 0)

    move_to_path = PARAMS[0].value 
    is_relative_path = false
    if not _PROGRAM_.env.root then return _callback.catch("missing remote machine object [file]...", 0)
    if move_to_path.split("/").len > 1 then file = Directory.find_file(_PROGRAM_.env.root, move_to_path) else file = Directory.find_file(_PROGRAM_.env.comp.File(Prompt.get_current_path), 0, move_to_path)
    if not move_to_path.split("/").len > 1 and move_to_path != ".." then is_relative_path = true
    if move_to_path == ".." then file = Directory.find_file(_PROGRAM_.env.root, Prompt.get_current_path).parent

    // analyzing data to find child files for relative path checks
    if is_relative_path then 
        found = false
        current_directory = Directory.find_file(_PROGRAM_.env.root, Prompt.get_current_path)
        for child in (current_directory.get_folders + current_directory.get_files)
            if not move_to_path.indexOf(child.path) == number and move_to_path != child.name then continue 
            found = true
        end for
    end if

    // completing standard error checks
    if is_relative_path then 
        if not found then return _callback.catch("file not found...", 0)
    end if  
    if not file then return _callback.catch("file not found...", 0)
    if not file.is_folder then return _callback.catch("target is not a directory", 0)
    

    Prompt.set_current_path(file.path)
    print // design line

    return _callback.catch("", 1)
end function 

_COMMAND_.cat = function(PARAMS) 
    cmd_requirements = function()
        if not PARAMS.len then return false
        return true 
    end function
    if not cmd_requirements then return _callback.catch("", 0)

    read_file = PARAMS[0].value 
    is_relative_path = false
    if not _PROGRAM_.env.root then return _callback.catch("missing remote machine object [file]...", 0)
    if read_file.split("/").len > 1 then file = Directory.find_file(_PROGRAM_.env.root, read_file)
    if not read_file.split("/").len > 1 then file = Directory.find_file(_PROGRAM_.env.comp.File(Prompt.get_current_path), 0, read_file)

    // analyzing data to find child files for relative path checks
    if is_relative_path then 
        found = false
        current_directory = Directory.find_file(_PROGRAM_.env.root, Prompt.get_current_path)
        for child in (current_directory.get_folders + current_directory.get_files)
            if not read_file.indexOf(child.path) == number and read_file != child.name then continue 
            found = true
        end for
    end if

    // completing standard error checks
    if is_relative_path then 
        if not found then return _callback.catch("file not found...", 0)
    end if  
    if not file then return _callback.catch("file not found...", 0)
    if file.is_folder then return _callback.catch("target is a directory", 0)

    print 
    print file.get_content.c
    print 

    return _callback.catch("", 1)
end function