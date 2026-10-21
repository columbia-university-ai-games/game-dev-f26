cmake_minimum_required(VERSION 3.16)
project(TheCatacomb C)
set(CMAKE_C_STANDARD 99)
set(CMAKE_C_STANDARD_REQUIRED ON)

include(CheckFunctionExists)

check_function_exists(stricmp STRICMP_EXISTS)
check_function_exists(strnicmp STRNICMP_EXISTS)
if(NOT STRICMP_EXISTS)
	add_definitions(-Dstricmp=strcasecmp)
endif(NOT STRICMP_EXISTS)
if(NOT STRNICMP_EXISTS)
	add_definitions(-Dstrnicmp=strncasecmp)
endif(NOT STRNICMP_EXISTS)

set(CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/CMake/;${CMAKE_MODULE_PATH}")
find_package(SDL2 CONFIG QUIET)
if(NOT TARGET SDL2::SDL2)
  find_package(SDL2 REQUIRED MODULE)
  include_directories(${SDL2_INCLUDE_DIR})
endif()

if(MSVC)
	add_definitions("/wd4996")
else(MSVC)
	set(CMAKE_C_FLAGS "-Wall -Wno-unused-result ${CMAKE_C_FLAGS}")
	set(CMAKE_CXX_FLAGS "-Wall -Wno-unused-result ${CMAKE_CXX_FLAGS}")
endif(MSVC)

# Typically reasonable to assume that an h file has a c/cpp file with it, so
# we can take the easy way and glob them.
file(GLOB HEADER_FILES *.h)

set(CATACOMB_SOURCES
	${HEADER_FILES}
	agent_bridge.c
	agent_protocol.c
	debug_tools.c
	cat_play.c
	catacomb.c
	catasm.c
	cpanel.c
	objects.c
	pcrlib_a.c
	pcrlib_c.c
	rleasm.c
)

add_executable(catacomb ${CATACOMB_SOURCES})
if(TARGET SDL2::SDL2)
  if(TARGET SDL2::SDL2main)
    target_link_libraries(catacomb SDL2::SDL2main)
  endif()
  target_link_libraries(catacomb SDL2::SDL2)
  if(WIN32)
    add_custom_command(TARGET catacomb POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different
      $<TARGET_FILE:SDL2::SDL2> $<TARGET_FILE_DIR:catacomb>)
  endif()
else()
  target_link_libraries(catacomb ${SDL2_LIBRARY})
endif()

include(CTest)
if(BUILD_TESTING)
  add_executable(test_agent_protocol tests/test_agent_protocol.c agent_protocol.c)
  target_include_directories(test_agent_protocol PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
  add_test(NAME agent_protocol COMMAND test_agent_protocol)
  add_executable(test_game_rules tests/test_game_rules.c ${CATACOMB_SOURCES})
  target_include_directories(test_game_rules PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
  target_compile_definitions(test_game_rules PRIVATE CATACOMB_TEST_BUILD SDL_MAIN_HANDLED)
  if(TARGET SDL2::SDL2)
    target_link_libraries(test_game_rules SDL2::SDL2)
  else()
    target_link_libraries(test_game_rules ${SDL2_LIBRARY})
  endif()
  add_test(NAME game_rules_and_observation_boundary COMMAND test_game_rules)
  find_package(Python3 COMPONENTS Interpreter QUIET)
  if(Python3_Interpreter_FOUND)
    add_test(NAME python_interface COMMAND ${Python3_EXECUTABLE} -m unittest discover
      -s ${CMAKE_CURRENT_SOURCE_DIR}/tests -p test_interface.py)
    set_tests_properties(python_interface PROPERTIES WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
    add_test(NAME python_release COMMAND ${Python3_EXECUTABLE} -m unittest discover
      -s ${CMAKE_CURRENT_SOURCE_DIR}/tests -p test_release.py)
    set_tests_properties(python_release PROPERTIES WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
    set(CATACOMB_TEST_DATA "" CACHE PATH "Optional local original .CA2 directory for headless integration tests")
    if(CATACOMB_TEST_DATA)
      add_test(NAME real_asset_integration COMMAND ${Python3_EXECUTABLE}
        ${CMAKE_CURRENT_SOURCE_DIR}/tests/test_live_game.py
        --exe $<TARGET_FILE:catacomb> --data ${CATACOMB_TEST_DATA})
      set_tests_properties(real_asset_integration PROPERTIES TIMEOUT 180)
    endif()
  endif()
endif()
