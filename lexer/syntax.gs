// lexer source

TokenTypes = {"Command": "COMMAND", "Float": "FLOAT", "Macro": "MACRO", "Assign": "ASSIGN", "Flag": "FLAG", "Number": "NUMBER", "ParenOpen": "PARENOPEN", "ParenClosed": "PARENCLOSED", "BracketOpen": "BRACKETOPEN", "BracketClosed": "BRACKETCLOSED", "Comma": "COMMA", "String": "STRING", "Pipe": "PIPE", "Dot": "DOT", "Argument": "ARGUMENT"}

Lexer = {}
Lexer.input = ""
Lexer.position = 0
Lexer.first_token = true
Lexer.token_output = []

Lexer.wipe = function()
    self.input = ""
    self.position = 0
    self.first_token = true
    self.token_output = []
end function


Lexer.get_input = function()
    return self.input
end function 

Lexer.set_input = function(new_input)
    self.input = new_input
    return self.input
end function

Lexer.consume = function()
    if Lexer.get_input() == "" then return null
    element = Lexer.get_input()[0]
    Lexer.set_input(Lexer.get_input()[1:])
    return element
end function

Lexer.next_token = function()
    ch = self.consume()
    if typeof(ch) == "null" then return null

    if ch.is_match("\s") then return self.next_token() // skip whitespace

    if ch.is_match(""""+"|'") then 
        quote = ch
        value = ""
        
         // move past the first character
        while self.position < self.input.len 
            next_char = self.consume()
            
            if next_char == quote then break 
            value = value + next_char
        end while 

        return { "type": TokenTypes.String, "value": value }
    end if 


    //Handle flags 

    if ch.is_match("\-+") then 
        flag = ch
        temp_flag = ch
        flag_content = []
        bracket_toggle = false
        
        while self.get_input().len > 0 and (ch.is_match("\-+") or ch.is_match("[a-zA-Z0-9_]+") or ch.is_match("\[\S+(,\s+?\S+)*\]"))
            next_char = self.consume()
            if next_char.is_match("\[") then bracket_toggle = true
            if not bracket_toggle and next_char.is_match("\s") then 
                break
            end if 
            
            temp_flag = temp_flag + next_char
        end while 

        return { "type": TokenTypes.Flag, "value": temp_flag }
    end if 
    
    //Handle numbers
    if ch.is_match("\d") then 
        number = ch
        //if ch == " " and number.len > 1 then return { "type": TokenTypes.Float, "value": number }
        
        while self.get_input().len > 0 and self.get_input()[self.position].is_match("\d|\.")
            next_number = self.consume()
            if typeof(("abcdefghigklmnopqrstuv" + "abcdefghigklmnopqrstuv ".upper).values.indexOf(next_number)) == "number" then break
            number = number + next_number
        end while
        
        return { "type": TokenTypes.Float, "value": number }
    end if

    //Handle commands
    if ch.is_match("[a-zA-z_]") or ch.is_match("\/") or self.get_input()[self.position].is_match("\.") then 

        keyword = ch
        
        while self.get_input().len > 0 and (self.get_input()[self.position].is_match("[a-zA-Z0-9_-]") or self.get_input()[self.position].is_match("\/") or self.get_input()[self.position].is_match("\."))
			keyword = keyword + self.consume()
        end while 

        if self.first_token then 
            self.first_token = false 
            //print { "type": TokenTypes.Command, "value": keyword }
            return { "type": TokenTypes.Command, "value": keyword }
        end if 
        //print{ "type": TokenTypes.Argument, "value": keyword }
        return { "type": TokenTypes.Argument, "value": keyword }
    end if

    //Handle Macros 
    if ch.is_match("$+") then 
        keyword = ch 

        while self.get_input().len > 0 and (self.get_input()[self.position].is_match("[a-zA-Z0-9_-]") or self.get_input()[self.position].is_match("\.") or self.get_input()[self.position].is_match("@"))
            keyword = keyword + self.consume()
        end while 

        if self.first_token then 
            self.first_token = false 
            //print { "type": TokenTypes.Command, "value": keyword }
            return { "type": TokenTypes.Macro, "value": keyword }
        end if 
        //print{ "type": TokenTypes.Argument, "value": keyword }
        
        if not typeof("(){}=,|".values.indexOf(keyword)) then return { "type": TokenTypes.Argument, "value": keyword }

    end if 

    //Handle punctuation (including comma for argument separation)
    if typeof("(){}=,|".values.indexOf(ch)) == "number" then self.consume()
    if ch == "(" then return { "type": TokenTypes.ParenOpen, "value": ch }
    if ch == ")" then return { "type": TokenTypes.ParenClosed, "value": ch }
    if ch == "{" then return { "type": TokenTypes.BracketOpen, "value": ch }
    if ch == "}" then return { "type": TokenTypes.BracketClosed, "value": ch }
    if ch == "=" then return { "type": TokenTypes.Assign, "value": ch }
    if ch == "," then return { "type": TokenTypes.Comma, "value": ch }
    if ch == "|" then return { "type": TokenTypes.Pipe, "value": ch }
    if ch.is_match("\.") then 
        dot_token = ch

        while self.get_input().len > 0 and self.get_input()[self.position].is_match("\.")
            next_char = self.consume()
            dot_token = dot_token + next_char
        end while 

        return { "type": TokenTypes.Dot, "value": dot_token }
    end if 
    //if ch.is_match("\.") then return { "type": TokenTypes.Dot, "value": ch }

    return true; //unexpected token
end function

Lexer.Tokenize = function() 
    self.token_output.push(self.next_token())
    if typeof(self.token_output[-1]) == "null" then 
        self.token_output = self.token_output[:-1]
        return self.token_output.clean([true])
    end if 
    if self.token_output[-1] == true then self.token_output = self.token_output[:-1]
	return self.Tokenize()
end function

// parser source 

Parser = {}
Parser.tokens = []
Parser.ast_output = []
Parser.current = 0

Parser.wipe = function()
    self.ast_output = []
    self.tokens = []
    self.current = 0
end function


Parser.set_tokens = function(new_tokens)
    self.tokens = new_tokens
    return self.tokens
end function


Parser.get_tokens = function()
    return self.tokens
end function 

Parser.set_current = function(new_current)
    self.current = new_current
    return self.current 
end function

Parser.get_current = function()
    return self.current
end function 

Parser.get_ast_output = function()
    return self.ast_output
end function 

Parser.set_ast_output = function(new_ast_output)
    self.ast_output = new_ast_output
    return self.ast_output
end function


Parser.consume = function()
    if not self.get_tokens().len then return null 
    element = self.get_tokens()[0]
    self.set_tokens(self.get_tokens()[1:])
    return element
end function

Parser.ParseCommand = function()
    args = []
    token = self.consume()

    if typeof(token) == "null" then return null

    if token.type == TokenTypes.Command then 
        command_token = { "type": TokenTypes.Command, "value": token.value }
        command_token.params = self.tokens
        self.get_ast_output().push(command_token)
        return command_token
    end if 

end function 

Parser.ParseCLI = function(input)
    Lexer.set_input(input)
    tokens = Lexer.Tokenize()
    Parser.set_tokens(tokens)
    Parser.ParseCommand()
    return Parser.get_ast_output()
end function 

Parser.reset = function()
 Lexer.wipe()
 self.wipe()
end function


// interpreter source

ExecutionTypes = {"Undefined": "UNDEFINED", "Command": "COMMAND", "Macro": "MACRO", "GlobalFlag": "GLOBALFLAG", "Assign": "ASSIGN", "Lookup": "LOOKUP"}

Interpreter = {}

Interpreter.input = []
Interpreter.ast_arr = []
Interpreter.chain_output = []
Interpreter.position = 0

Interpreter.get_input = function()
    return self.input 
end function 

Interpreter.set_input = function(new_input)
    self.input = new_input 
    return self.input 
end function 

Interpreter.wipe = function(wipe_chain = 0, wipe_input = 0)
    self.ast_arr = []
    self.position = 0
    if wipe_chain then self.chain = []
    if wipe_input then self.input = []
end function 

Interpreter.get_ast_arr = function()
    return self.ast_arr
end function 

Interpreter.set_ast_arr = function(new_ast_arr)
    self.ast_arr = new_ast_arr
    return self.get_ast_arr()
end function

Interpreter.current_token = function()
    if not self.ast_arr.len then return false 
    return self.ast_arr[self.position]
end function 

Interpreter.consume_input = function()
    if not self.get_input().len then return null 
    element = self.get_input()[0]
    self.set_input(self.get_input()[1:])
    return element
end function 

Interpreter.peek_input = function()
    if not self.get_input().len then return false 
    if not self.get_input().hasIndex(1) then return false 
    return self.get_input()[1]
end function

Interpreter.consume_ast = function() 
    if not self.get_ast_arr().len then return null 
    element = self.get_ast_arr()[0]
    self.set_ast_arr(self.get_ast_arr()[1:])
    return element 
end function 

Interpreter.peek_ast = function()
    if not self.ast_arr.len then return false 
    if not self.ast_arr.hasIndex(self.position + 1) then return false
    return self.ast_arr[self.position + 1]
end function 

Interpreter.run_command = function(command_ast, show_error = 1, data = 0)

    if not command.hasIndex(command_ast[0].value) then 
        print
        printb("[blbx][sys]: command not found...".c)
        print 
        return _callback.catch("", 0) 
    end if 
  
    safe_run_result = Session.process.safe_run(command_ast[0].value, command_ast[0].params, data)
    
    if not safe_run_result.status and show_error then
        print(b + safe_run_result.data.c)
        print 
    end if

    return safe_run_result
end function 


Interpreter.determine_execution_type = function()
    current_ast = self.consume_ast()
    if not current_ast then return null
    assign_token = {"type": TokenTypes.Assign, "value": "="}
    
    if current_ast.type == TokenTypes.Command and (current_ast.hasIndex("params") and typeof(current_ast.params.indexOf(assign_token)) == "number") then
        assignment = current_ast.params

        if not assignment.len == 2 or (assignment.hasIndex(0) and assignment[0] != assign_token) then 
            Usage.display("syntax_assign", Usage.get_usage_object("syntax_assign"))
            return _callback.catch("[blbx][syntax][err]: invalid assignment. one value must be on either side of an assignment.")
        end if

        
        if not typeof([TokenTypes.Command, TokenTypes.Macro, TokenTypes.Flag].indexOf(current_ast.type)) == "number" then
            Usage.display("syntax_assign", Usage.get_usage_object("syntax_assign"))
            return _callback.catch("[blbx][syntax][err]: invalid assignment. must have a keyword, macro, or flag on the left side of assignment.")
        end if   

        if current_ast.type == TokenTypes.Command then return { "type": ExecutionTypes.Assign, "left": current_ast.value, "right": assignment[1] }
    end if  

    // if TokenTypes.Flag, TokenTypes.Macro

    if typeof([TokenTypes.Command].indexOf(current_ast.type)) == "number" then 
        //check if command exists 
        if typeof(_COMMAND_.indexes.indexOf(current_ast.value)) == "number" then return { "type": ExecutionTypes.Command, "left": current_ast.value, "right": current_ast.params }
    end if 

    if typeof([TokenTypes.Macro].indexOf(current_ast.type)) == "number" then
        if not Session.env.macro.has(current_ast.value) then return { "Type": ExecutionTypes.Macro, "left": current_ast, "right": "undefined" }
        return { "type": ExecutionTypes.Macro, "left": current_ast, "right": self.ast_arr[1:] }
    end if

    if self.ast_arr.len == 1 and typeof([TokenTypes.String, TokenTypes.Float].indexOf(current_ast.type)) == "number" then return { "type": ExecutionTypes.Lookup, "value": current_ast.value }
    
    if self.ast_arr.len == 1 and typeof([TokenTypes.Flag].indexOf(current_ast.type)) == "number" then
        variable_instance = Session.env.var.get(current_ast.values)
        if Session.env.var.has(current_ast.value) then return { "type": ExecutionTypes.Lookup, "value": "undefined" }
        return { "type": ExecutionTypes.Lookup, "value": variable_instance }
    end if 

    return { "type": ExecutionTypes.Undefined, "value": "undefined" }
end function 



Interpreter.Execute = function()
    Parser.reset()
    self.wipe()
    _callback.toggle_debug()
    next_input = self.consume_input()
    if not next_input then return self.chain_output
    next_input = next_input.trim
    _callback.toggle_debug()
    command_ast = Parser.ParseCLI(next_input)
    self.set_ast_arr(command_ast)
    
    interpreter_ast = self.determine_execution_type()
    if not interpreter_ast then return self.Execute()
    if interpreter_ast.hasIndex("status") and not interpreter_ast.status then 
        print 
        printb(interpreter_ast.data.c) // print out syntactical error message
        print 
        Parser.reset() 
        return self.chain_output
    end if 
    if interpreter_ast.type == ExecutionTypes.Assign then 
        Session.env.var.set(interpreter_ast.left, interpreter_ast.right.value)
        print
        printb(str(Session.env.var.get(interpreter_ast.left)).c("purple"))
        print 
    end if 

    if interpreter_ast.type == ExecutionTypes.Lookup then 

    end if 

    if interpreter_ast.type == ExecutionTypes.Command then 
        //_callback.local_debug("<color=blue>" + interpreter_ast, "interpreter_ast", 174)
        safe_run_result = _PROGRAM_.process.safe_run(interpreter_ast.left, interpreter_ast.right)
        if safe_run_result.status then self.chain_output.push(safe_run_result)
        
        if ((safe_run_result.hasIndex("status") and not safe_run_result.status)) and safe_run_result.data.len then 
            print 
            print (safe_run_result.data.c.b)
            print 
        end if 
    end if 

    //lookup
    return self.Execute()
end function

// interpreter

// syntax